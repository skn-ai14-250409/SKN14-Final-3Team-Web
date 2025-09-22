import os
import logging
from typing import Dict, List, Any, Optional

import numpy as np
import pandas as pd
from django.conf import settings
import joblib

logger = logging.getLogger(__name__)

# --- Base Model Class ---
class LoanApprovalModel:
    """
    Joblib inference wrapper for loan approval.
    모든 예측에서 scaler.pkl을 반드시 사용하여 transform을 진행합니다.
    """

    _instance: Optional["LoanApprovalModel"] = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        self._model = None
        self._scaler = None
        self.feature_columns: List[str] = []
        self.threshold: float = 0.5
        self.model_path: str = ""
        self.scaler_path: str = ""

    def _ensure_loaded(self) -> None:
        if self._model is not None and self._scaler is not None:
            return
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"Loan model not found at {self.model_path}."
            )
        try:
            self._model = joblib.load(self.model_path)
            logger.info(f"Loaded joblib model from {self.model_path}")
        except Exception as e:
            raise RuntimeError(f"Failed to load loan model from {self.model_path}: {e}")

        if not os.path.exists(self.scaler_path):
            raise FileNotFoundError(
                f"Scaler not found at {self.scaler_path}."
            )
        try:
            self._scaler = joblib.load(self.scaler_path)
            logger.info(f"Loaded scaler from {self.scaler_path}")
        except Exception as e:
            raise RuntimeError(f"Failed to load scaler from {self.scaler_path}: {e}")

    def _to_dataframe(self, features: Dict[str, Any]) -> pd.DataFrame:
        row = {col: features.get(col) for col in self.feature_columns}
        return pd.DataFrame([row], columns=self.feature_columns)

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        self._ensure_loaded()
        X = self._to_dataframe(features)
        # 무조건 scaler transform 적용
        X = self._scaler.transform(X)
        prob: float
        if hasattr(self._model, "predict_proba"):
            pred = self._model.predict_proba(X)
            prob = float(pred[0][1])
        elif hasattr(self._model, "predict"):
            pred = self._model.predict(X)
            prob = float(pred[0])
        else:
            raise RuntimeError("Loaded model has no predict_proba or predict method.")
        decision = 1 if prob >= self.threshold else 0
        return {"prob": prob, "decision": decision}

# --- Personal Model ---
class PersonalLoanApprovalModel(LoanApprovalModel):
    def __init__(self) -> None:
        super().__init__()
        self.feature_columns: List[str] = getattr(
            settings,
            "PERSONAL_LOAN_FEATURE_COLUMNS",
            [
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
                "previous_loan_defaults_on_file"
            ],
        )
        self.threshold: float = float(getattr(settings, "PERSONAL_LOAN_DECISION_THRESHOLD", 0.5))
        self.model_path: str = getattr(
            settings,
            "PERSONAL_LOAN_LGBM_MODEL_PATH",
            os.path.join(settings.BASE_DIR, "ml_models", "personal_loan_lgbm.pkl"),
        )
        self.scaler_path: str = getattr(
            settings,
            "PERSONAL_LOAN_SCALER_PATH",
            os.path.join(settings.BASE_DIR, "ml_models", "personal_loan_scaler.pkl"),
        )

def build_features_from_personal_application(application) -> Dict[str, Any]:
    cust = getattr(application, "customer", None)
    person = getattr(cust, "person", None)
    person_age = getattr(person, "age", None)
    person_income = getattr(person, "income_annual", None)
    person_emp_exp = getattr(person, "work_experience_years", None)
    person_gender = getattr(person, "gender", None)
    person_education = getattr(person, "education", None)
    person_home_ownership = getattr(person, "home_ownership", None)
    loan_amnt = getattr(application, "amount", None)
    loan_intent = getattr(application, "intent", None)
    loan_int_rate = getattr(application, "interest_rate", None)
    loan_percent_income = getattr(application, "percent_income", None)
    cb_person_cred_hist_length = getattr(person, "credit_history_length", None)
    credit_score = getattr(person, "credit_rating", None)
    previous_loan_defaults_on_file = getattr(person, "previous_loan_defaults_on_file", None)
    features: Dict[str, Any] = {
        "person_age": float(person_age) if person_age is not None else None,
        "person_income": float(person_income) if person_income is not None else None,
        "person_emp_exp": float(person_emp_exp) if person_emp_exp is not None else None,
        "loan_amnt": float(loan_amnt) if loan_amnt is not None else None,
        "loan_int_rate": float(loan_int_rate) if loan_int_rate is not None else None,
        "loan_percent_income": float(loan_percent_income) if loan_percent_income is not None else None,
        "cb_person_cred_hist_length": float(cb_person_cred_hist_length) if cb_person_cred_hist_length is not None else None,
        "credit_score": int(credit_score) if credit_score is not None else None,
        "person_gender": person_gender if person_gender is not None else None,
        "person_education": person_education if person_education is not None else None,
        "person_home_ownership": person_home_ownership if person_home_ownership is not None else None,
        "loan_intent": loan_intent if loan_intent is not None else None,
        "previous_loan_defaults_on_file": (
            str(previous_loan_defaults_on_file).upper() if previous_loan_defaults_on_file is not None else None
        ),
    }
    return features

# --- Corporate Model ---
class CorporateLoanApprovalModel(LoanApprovalModel):
    def __init__(self) -> None:
        super().__init__()
        self.feature_columns: List[str] = [
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
            "Piotroski_F"
        ]
        self.threshold: float = float(getattr(settings, "CORPORATE_LOAN_DECISION_THRESHOLD", 0.5))
        self.model_path: str = getattr(
            settings,
            "CORPORATE_LOAN_LGBM_MODEL_PATH",
            os.path.join(settings.BASE_DIR, "ml_models", "corporate_loan_lgbm.pkl"),
        )
        self.scaler_path: str = getattr(
            settings,
            "CORPORATE_LOAN_SCALER_PATH",
            os.path.join(settings.BASE_DIR, "ml_models", "corporate_loan_scaler.pkl"),
        )

def build_features_from_corporate_application(application) -> Dict[str, Any]:
    corp = getattr(application, "corporate", None)
    features: Dict[str, Any] = {
        "year": 2024,
        "Current assets": float(getattr(corp, "current_assets", None) or 0),
        "Cost of goods sold": float(getattr(corp, "cost_of_goods_sold", None) or 0),
        "Depreciation and amortization": float(getattr(corp, "depreciation_and_amortization", None) or 0),
        "EBITDA": float(getattr(corp, "ebitda", None) or 0),
        "Inventory": float(getattr(corp, "inventory", None) or 0),
        "Net Income": float(getattr(corp, "net_income", None) or 0),
        "Total Receivables": float(getattr(corp, "total_receivables", None) or 0),
        "Market value": float(getattr(corp, "market_value", None) or 0),
        "Net sales": float(getattr(corp, "net_sales", None) or 0),
        "Total assets": float(getattr(corp, "total_assets", None) or 0),
        "Total Long-term debt": float(getattr(corp, "total_long_term_debt", None) or 0),
        "EBIT": float(getattr(corp, "ebit", None) or 0),
        "Gross Profit": float(getattr(corp, "gross_profit", None) or 0),
        "Total Current Liabilities": float(getattr(corp, "total_current_liabilities", None) or 0),
        "Retained Earnings": float(getattr(corp, "retained_earnings", None) or 0),
        "Total Revenue": float(getattr(corp, "total_revenue", None) or 0),
        "Total Liabilities": float(getattr(corp, "total_liabilities", None) or 0),
        "Total Operating Expenses": float(getattr(corp, "total_operating_expenses", None) or 0),
        "Net Profit Margin": float(getattr(corp, "net_profit_margin", None) or 0),
        "Gross Profit Margin": float(getattr(corp, "gross_profit_margin", None) or 0),
        "ROA": float(getattr(corp, "roa", None) or 0),
        "ROS": float(getattr(corp, "ros", None) or 0),
        "Current Ratio": float(getattr(corp, "current_ratio", None) or 0),
        "Quick Ratio": float(getattr(corp, "quick_ratio", None) or 0),
        "Debt to asset ratio": float(getattr(corp, "debt_to_asset_ratio", None) or 0),
        "Altman_Z": float(getattr(corp, "altman_z", None) or 0),
        "Ohlson_O": float(getattr(corp, "ohlson_o", None) or 0),
        "Piotroski_F": int(getattr(corp, "piotroski_f", None) or 0),
    }
    return features

# --- Factory Function ---
def get_model_and_features(application, customer_type: str):
    """
    customer_type: 'personal' 또는 'corporate'
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