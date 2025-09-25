import os
import logging
from typing import Dict, List, Any, Optional

import numpy as np
import pandas as pd
from django.conf import settings
import joblib

logger = logging.getLogger(__name__)


# ---------------------------
# 공통 유틸
# ---------------------------
def _to_01(v) -> int:
    """'Yes/No', 'Y/N', 'true/false', '1/0' 등 다양한 입력을 0/1로 정규화"""
    if v is None:
        return 0
    if isinstance(v, (int, float)):
        return int(float(v) != 0.0)
    s = str(v).strip().lower()
    if s in {"y", "yes", "true", "1", "t"}:
        return 1
    if s in {"n", "no", "false", "0", "f"}:
        return 0
    # 그 외 문자열은 결측 취급 → 0
    return 0


def _safe_float(v):
    try:
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return np.nan
        return float(v)
    except Exception:
        return np.nan


# ---------------------------
# Base Model
# ---------------------------
class LoanApprovalModel:
    """
    Joblib inference wrapper for loan approval.
    - 모든 예측에서 scaler.pkl을 사용해 transform
    - self._preprocess(...)에서 학습 때와 동일 전처리 수행
    """

    _instance: Optional["LoanApprovalModel"] = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        self._model = None
        self._scaler = None
        # 주의: personal 모델에서는 '학습 후 원-핫 완료된 최종 컬럼'으로 덮어씁니다.
        self.feature_columns: List[str] = []
        self.threshold: float = 0.5
        self.model_path: str = ""
        self.scaler_path: str = ""

    # ---------- 로딩 & 피처 이름 ----------
    def _ensure_loaded(self) -> None:
        if self._model is not None and self._scaler is not None:
            return

        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Loan model not found at {self.model_path}.")
        try:
            self._model = joblib.load(self.model_path)
            logger.info(f"Loaded joblib model from {self.model_path}")
        except Exception as e:
            raise RuntimeError(f"Failed to load loan model from {self.model_path}: {e}")

        if not os.path.exists(self.scaler_path):
            raise FileNotFoundError(f"Scaler not found at {self.scaler_path}.")
        try:
            self._scaler = joblib.load(self.scaler_path)
            logger.info(f"Loaded scaler from {self.scaler_path}")
        except Exception as e:
            raise RuntimeError(f"Failed to load scaler from {self.scaler_path}: {e}")

        # 학습된 모델에서 '기대하는 피처 이름'을 읽어와 저장
        expected = None
        # 1) LightGBM scikit wrapper: feature_name_
        if hasattr(self._model, "feature_name_") and self._model.feature_name_:
            expected = list(self._model.feature_name_)
        # 2) LightGBM booster API
        if expected is None and hasattr(self._model, "booster_"):
            try:
                expected = list(self._model.booster_.feature_name())
            except Exception:
                expected = None
        # 3) XGBoost/Sklearn 모델들: n_features_in_만 있을 수 있음 → settings에서 주입
        if expected is None and getattr(settings, "PERSONAL_LOAN_TRAIN_COLUMNS", None):
            expected = list(getattr(settings, "PERSONAL_LOAN_TRAIN_COLUMNS"))

        if expected:
            self.feature_columns = expected
            logger.info("Expected feature columns loaded from model: %d cols", len(self.feature_columns))
        else:
            # 기업 모델처럼 '원-핫 없음/고정 컬럼' 케이스는 subclass에서 이미 세팅됨
            if not self.feature_columns:
                raise RuntimeError(
                    "Cannot determine expected feature columns from model. "
                    "Provide PERSONAL_LOAN_TRAIN_COLUMNS in settings or use a model that stores feature names."
                )

    # ---------- 전처리 (서브클래스에서 구현) ----------
    def _preprocess(self, features: Dict[str, Any]) -> pd.DataFrame:
        """
        서브클래스에서 학습시 전처리 파이프라인을 구현한다.
        반환: 모델이 기대하는 컬럼 순서로 정렬된 DataFrame (원-핫/스케일링 전)
        """
        raise NotImplementedError

    # ---------- 예측 ----------
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        self._ensure_loaded()

        # 1) 학습 때와 동일 전처리 → X_raw (모델이 기대하는 원-핫 완료 컬럼명과 동일)
        X_raw = self._preprocess(features)

        # 2) 결측 처리(스케일러는 NaN 허용하지 않음)
        X_raw = X_raw.fillna(0.0)

        # 3) 스케일 변환
        try:
            X = self._scaler.transform(X_raw)
        except Exception as e:
            raise RuntimeError(
                f"Scaler.transform failed. Shape={X_raw.shape}, Columns(head)={list(X_raw.columns[:5])}... Error: {e}"
            )

        # 4) 예측
        if hasattr(self._model, "predict_proba"):
            pred = self._model.predict_proba(X)
            prob = float(pred[0][1])
        elif hasattr(self._model, "predict"):
            pred = self._model.predict(X)
            # 일부 회귀/점수 모델이면 그대로 쓰고, 분류면 0/1로 들어올 수 있음
            prob = float(pred[0])
        else:
            raise RuntimeError("Loaded model has no predict_proba or predict method.")

        decision = 1 if prob >= self.threshold else 0
        return {"prob": prob, "decision": decision}


# ---------------------------
# Personal (개인) Model
# ---------------------------
class PersonalLoanApprovalModel(LoanApprovalModel):
    """
    노트북 전처리 반영:
      1) 이상치 제거/캡핑: person_age <=100, person_emp_exp <=60 (행 제거 대신 캡핑)
      2) previous_loan_defaults_on_file 라벨 정정: Yes→1, No→0
      3) person_income 로그 변환: log1p
      4) 범주형 원-핫 인코딩(drop_first=True)
      5) 모델이 학습한 최종 컬럼 이름에 reindex → 스케일링
    """

    RAW_FEATURES = [
        "person_age",
        "person_gender",
        "person_education",
        "person_income",
        "person_emp_exp",
        "person_home_ownership",
        "loan_amnt",
        "loan_intent",
        "loan_int_rate",
        "loan_percent_income",
        "cb_person_cred_hist_length",
        "credit_score",
        "previous_loan_defaults_on_file",
    ]

    def __init__(self) -> None:
        super().__init__()
        # threshold & 경로
        self.threshold = float(getattr(settings, "PERSONAL_LOAN_DECISION_THRESHOLD", 0.5))
        self.model_path = getattr(
            settings,
            "PERSONAL_LOAN_LGBM_MODEL_PATH",
            os.path.join(settings.BASE_DIR, "ml_models", "personal_loan_lgbm.pkl"),
        )
        self.scaler_path = getattr(
            settings,
            "PERSONAL_LOAN_SCALER_PATH",
            os.path.join(settings.BASE_DIR, "ml_models", "personal_loan_scaler.pkl"),
        )

    # ---- 핵심: 학습 때와 동일 전처리 ----
    def _preprocess(self, features: Dict[str, Any]) -> pd.DataFrame:
        # 0) 1행 DF로 구성 (원본 컬럼 이름 유지)
        row = {}
        for col in self.RAW_FEATURES:
            row[col] = features.get(col)
        df = pd.DataFrame([row], columns=self.RAW_FEATURES)

        # 1) 타입 캐스팅 & 라벨 정정
        #    - 숫자형 캐스팅
        num_cols = [
            "person_age",
            "person_income",
            "person_emp_exp",
            "loan_amnt",
            "loan_int_rate",
            "loan_percent_income",
            "cb_person_cred_hist_length",
            "credit_score",
        ]
        for c in num_cols:
            df[c] = _safe_float(df[c])

        #    - previous_loan_defaults_on_file: Yes/No → 1/0
        df["previous_loan_defaults_on_file"] = int(_to_01(df.loc[0, "previous_loan_defaults_on_file"]))

        #    - 범주형을 object로 (원-핫 대상)
        cat_cols = ["person_gender", "person_education", "person_home_ownership", "loan_intent"]
        for c in cat_cols:
            # None → 'Unknown'으로 채우면 학습에 없던 더미가 생길 수 있지만,
            # 최종 reindex에서 빠지며 해당 그룹의 기준 카테고리(올-제로)로 처리됨
            val = df.loc[0, c]
            df[c] = (str(val).strip() if val is not None else "Unknown")

        # 2) 이상치 캡핑 (노트북은 행 제거였지만, 추론에서는 cap으로 안전하게)
        if pd.notna(df.loc[0, "person_age"]):
            df.loc[0, "person_age"] = np.clip(df.loc[0, "person_age"], 18, 100)
        if pd.notna(df.loc[0, "person_emp_exp"]):
            df.loc[0, "person_emp_exp"] = np.clip(df.loc[0, "person_emp_exp"], 0, 60)

        # 3) 로그 변환: person_income → log1p
        if pd.notna(df.loc[0, "person_income"]):
            df.loc[0, "person_income"] = np.log1p(df.loc[0, "person_income"])
        else:
            df.loc[0, "person_income"] = 0.0  # 결측 시 0 처리 후 log1p와 일관성 유지

        # 4) 원-핫 인코딩(drop_first=True) — 노트북과 동일
        #    주의: 숫자/이진(0/1) 컬럼은 그대로 두고, object dtype만 더미화
        obj_cols = df.select_dtypes(include=["object"]).columns.tolist()
        df_enc = pd.get_dummies(df, columns=obj_cols, drop_first=True)

        # 5) 모델이 기대하는 최종 컬럼으로 정렬 (없으면 0으로 채움)
        #    _ensure_loaded()에서 self.feature_columns를 모델로부터 가져옴
        #    만약 기대 컬럼이 없으면 예외 발생시켜 조기 발견
        if not self.feature_columns:
            raise RuntimeError("Expected feature columns are unknown. Model must provide feature names.")

        # 누락된 컬럼 보강 & 순서 정렬
        X = df_enc.reindex(columns=self.feature_columns, fill_value=0.0)

        # 디버깅 도움 로그
        if df_enc.shape[1] != X.shape[1]:
            missing = set(self.feature_columns) - set(df_enc.columns)
            extra = set(df_enc.columns) - set(self.feature_columns)
            if missing:
                logger.debug(f"[Personal] Added missing dummy columns (filled with 0): {sorted(list(missing))[:10]}...")
            if extra:
                logger.debug(f"[Personal] Dropped unseen dummy columns: {sorted(list(extra))[:10]}...")

        return X


def build_features_from_personal_application(application) -> Dict[str, Any]:
    """
    DB 객체에서 원본 13개 특성만 뽑는다.
    - 라벨 정정/원-핫/로그/캡핑/정렬/스케일은 모델.predict 내부 _preprocess에서 수행
    """
    cust = getattr(application, "customer", None)
    person = getattr(cust, "person", None)

    features: Dict[str, Any] = {
        "person_age": _safe_float(getattr(person, "age", None)),
        "person_gender": getattr(person, "gender", None),
        "person_education": getattr(person, "education", None),
        "person_income": _safe_float(getattr(person, "income_annual", None)),
        "person_emp_exp": _safe_float(getattr(person, "work_experience_years", None)),
        "person_home_ownership": getattr(person, "home_ownership", None),
        "loan_amnt": _safe_float(getattr(application, "amount", None)),
        "loan_intent": getattr(application, "intent", None),
        "loan_int_rate": _safe_float(getattr(application, "interest_rate", None)),
        "loan_percent_income": _safe_float(getattr(application, "percent_income", None)),
        "cb_person_cred_hist_length": _safe_float(getattr(person, "credit_history_length", None)),
        "credit_score": _safe_float(getattr(person, "credit_rating", None)),
        # 다양한 형태('Y','Yes',1 등)를 허용 → _preprocess에서 _to_01로 일괄 정규화
        "previous_loan_defaults_on_file": getattr(person, "previous_loan_defaults_on_file", None),
    }
    return features


# ---------------------------
# Corporate (기업) Model
# ---------------------------
class CorporateLoanApprovalModel(LoanApprovalModel):
    """
    기업은 모두 수치형이라 원-핫 없음.
    - 결측은 0 대체
    - 학습 스케일러/모델의 컬럼 순서에 맞춰 정렬
    """
    def __init__(self) -> None:
        super().__init__()
        self.feature_columns = [
            "year",
            "Current assets",
            "Cost of goods sold",
            "Depreciation and amortization",
            "EBITDA",
            "Inventory",
            "Net Income",
            "Total Receivables",
            "Market value",
            "Net sales",
            "Total assets",
            "Total Long-term debt",
            "EBIT",
            "Gross Profit",
            "Total Current Liabilities",
            "Retained Earnings",
            "Total Revenue",
            "Total Liabilities",
            "Total Operating Expenses",
            "Net Profit Margin",
            "Gross Profit Margin",
            "ROA",
            "ROS",
            "Current Ratio",
            "Quick Ratio",
            "Debt to asset ratio",
            "Altman_Z",
            "Ohlson_O",
            "Piotroski_F",
        ]
        self.threshold = float(getattr(settings, "CORPORATE_LOAN_DECISION_THRESHOLD", 0.5))
        self.model_path = getattr(
            settings,
            "CORPORATE_LOAN_LGBM_MODEL_PATH",
            os.path.join(settings.BASE_DIR, "ml_models", "corporate_loan_lgbm.pkl"),
        )
        self.scaler_path = getattr(
            settings,
            "CORPORATE_LOAN_SCALER_PATH",
            os.path.join(settings.BASE_DIR, "ml_models", "corporate_loan_scaler.pkl"),
        )

    def _preprocess(self, features: Dict[str, Any]) -> pd.DataFrame:
        row = {col: _safe_float(features.get(col)) for col in self.feature_columns}
        df = pd.DataFrame([row], columns=self.feature_columns)
        return df


def build_features_from_corporate_application(application) -> Dict[str, Any]:
    corp = getattr(application, "corporate", None)
    features: Dict[str, Any] = {
        "year": 2024,
        "Current assets": _safe_float(getattr(corp, "current_assets", None)),
        "Cost of goods sold": _safe_float(getattr(corp, "cost_of_goods_sold", None)),
        "Depreciation and amortization": _safe_float(getattr(corp, "depreciation_and_amortization", None)),
        "EBITDA": _safe_float(getattr(corp, "ebitda", None)),
        "Inventory": _safe_float(getattr(corp, "inventory", None)),
        "Net Income": _safe_float(getattr(corp, "net_income", None)),
        "Total Receivables": _safe_float(getattr(corp, "total_receivables", None)),
        "Market value": _safe_float(getattr(corp, "market_value", None)),
        "Net sales": _safe_float(getattr(corp, "net_sales", None)),
        "Total assets": _safe_float(getattr(corp, "total_assets", None)),
        "Total Long-term debt": _safe_float(getattr(corp, "total_long_term_debt", None)),
        "EBIT": _safe_float(getattr(corp, "ebit", None)),
        "Gross Profit": _safe_float(getattr(corp, "gross_profit", None)),
        "Total Current Liabilities": _safe_float(getattr(corp, "total_current_liabilities", None)),
        "Retained Earnings": _safe_float(getattr(corp, "retained_earnings", None)),
        "Total Revenue": _safe_float(getattr(corp, "total_revenue", None)),
        "Total Liabilities": _safe_float(getattr(corp, "total_liabilities", None)),
        "Total Operating Expenses": _safe_float(getattr(corp, "total_operating_expenses", None)),
        "Net Profit Margin": _safe_float(getattr(corp, "net_profit_margin", None)),
        "Gross Profit Margin": _safe_float(getattr(corp, "gross_profit_margin", None)),
        "ROA": _safe_float(getattr(corp, "roa", None)),
        "ROS": _safe_float(getattr(corp, "ros", None)),
        "Current Ratio": _safe_float(getattr(corp, "current_ratio", None)),
        "Quick Ratio": _safe_float(getattr(corp, "quick_ratio", None)),
        "Debt to asset ratio": _safe_float(getattr(corp, "debt_to_asset_ratio", None)),
        "Altman_Z": _safe_float(getattr(corp, "altman_z", None)),
        "Ohlson_O": _safe_float(getattr(corp, "ohlson_o", None)),
        "Piotroski_F": int(getattr(corp, "piotroski_f", None) or 0),
    }
    return features


# ---------------------------
# Factory
# ---------------------------
def get_model_and_features(application, customer_type: str):
    """
    customer_type: 'personal' | 'corporate'
    application: DB에서 가져온 신청 객체
    """
    if customer_type == "personal":
        model = PersonalLoanApprovalModel()
        features = build_features_from_personal_application(application)
    elif customer_type == "corporate":
        model = CorporateLoanApprovalModel()
        features = build_features_from_corporate_application(application)
    else:
        raise ValueError("customer_type must be 'personal' or 'corporate'")
    return model, features
