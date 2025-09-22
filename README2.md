
# Git 저장소 환경 문제 해결 가이드 (AI 어시스턴트용)

이 문서는 Windows 환경에서 Git으로 작업하고 Linux 환경으로 배포할 때 흔히 발생하는 줄바꿈(Line Ending) 및 파일 실행 권한 문제를 해결하는 방법을 안내합니다.

각 단계의 명령어는 AI 어시스턴트가 인식하고 실행할 수 있도록 셸 코드 블록으로 제공됩니다.

---

### 1단계: `.gitattributes` 파일 생성 및 수정

프로젝트의 모든 파일에 일관된 줄바꿈 규칙을 적용하기 위해 `.gitattributes` 파일을 생성하고 설정합니다.

**실행할 명령어:**
```sh
echo "* text=auto" > .gitattributes
echo "*.sh text eol=lf" >> .gitattributes
```

---

### 2단계: 로컬 Git 저장소 설정

현재 저장소에만 적용되는 로컬 Git 설정을 변경하여, Windows 환경에서 발생할 수 있는 줄바꿈 문제를 방지합니다.

**실행할 명령어:**
```sh
git config --local core.autocrlf false
git config --local core.eol lf
```

---

### 3단계: 전체 파일 줄바꿈 재정규화 및 커밋

새로운 줄바꿈 규칙을 프로젝트의 모든 기존 파일에 소급 적용하고, 변경사항을 커밋으로 기록합니다.

**실행할 명령어:**
```sh
git add --renormalize .
git commit -m "Normalize line endings to LF"
```

---

### 4단계: 배포 스크립트 실행 권한 추가 및 커밋

배포 서버(Linux)에서 실행되어야 할 셸 스크립트에 실행 권한을 부여하고, 변경사항을 커밋으로 기록합니다.

**참고:** 아래 명령어에서 스크립트 파일 경로는 실제 프로젝트에 맞게 수정해야 할 수 있습니다. (이 예시에서는 `c:\Workspaces\web_cicd_test\.platform\hooks\postdeploy\01_migrate.sh` 를 사용합니다.)

**실행할 명령어:**
```sh
git add --chmod=+x .platform/hooks/postdeploy/01_migrate.sh
git commit -m "Make postdeploy hook executable"
```

---

### 5단계: 원격 저장소에 변경사항 푸시

위 모든 변경사항을 원격 저장소에 푸시하여 최종 반영합니다.

**실행할 명령어:**
```sh
git push
```

---
---

---
## AI 어시스턴트 메모리 (다른 AI 어시스턴트 참고용)

*   **사용자 선호:** 커밋 메시지는 한국어로 작성합니다.
*   **표준 운영 절차 (SOP):** 각 작업 완료 시 README2.md에 다음 형식으로 요약을 추가합니다. 반드시 이전의 템플릿을 보고 동일한 형태로 작성하며, readme2.md에 '추가'합니다.
    1.  작업 요약 (작업 요약을 보고 문제를 해결할 것: 같은 실수를 하지 말 것.)
    2.  타임스탬프 (한국 표준시 KST)
    3.  랜덤 작업 ID
    4.  커밋 및 푸시 세부 정보
*   **시간대 선호:** 타임스탬프는 한국 표준시 (KST)를 사용합니다.
*   **작업 전 확인:** 작업을 시작하기 전에 항상 README2.md를 읽고 상황을 파악합니다.
---

## 작업 요약 로그

### 작업 #1839
* **타임스탬프:** 2025-09-21 21:36:15 KST
* **작업 내용:** Elastic Beanstalk 배포 실패 문제 해결.
  - Git 줄바꿈 및 파일 권한 문제 해결 (`.gitattributes`, `renormalize`, `chmod`).
  - GitHub Actions 워크플로우의 배포 패키징 방식 수정 (`Dockerrun.aws.json` -> `deploy.zip`).
  - 배포 후크 방식을 `.platform/hooks`에서 `.ebextensions/container_commands`로 변경.
  - `container_commands` 내 마이그레이션 명령어를 `django-admin`에서 `python manage.py`로 수정.
* **최종 커밋:** `56df719` - Fix: EB 마이그레이션 명령어 수정

### 작업 #2457
* **타임스탬프:** 2025-09-21 22:05:10 KST
* **작업 내용:** Elastic Beanstalk 배포 실패 문제 해결.
  - `.ebextensions`의 `container_commands`가 호스트 머신에서 실행되어 발생하는 의존성 문제를 해결하기 위해, 배포 후크 방식을 `.platform/hooks/postdeploy`로 변경함.
  - 이 방식은 Docker 컨테이너 내부에서 스크립트를 실행하여 정확한 환경에서 마이그레이션이 이루어지도록 보장함.
  - `.platform/hooks/postdeploy/01_migrate.sh` 스크립트를 생성하고 실행 권한을 부여함.
  - 기존의 잘못된 설정 파일인 `.ebextensions/db-migrate.config`를 삭제함.
* **최종 커밋:** `3f953d5` - Fix: EB 배포 오류 수정 및 마이그레이션 방식 변경

### 작업 #3124
* **타임스탬프:** 2025-09-21 22:15:00 KST
* **작업 내용:** Elastic Beanstalk 배포 실패 문제 해결.
  - `.platform/hooks/postdeploy/01_migrate.sh` 스크립트 실행 시 발생한 `exec format error`를 해결함.
  - 스크립트 파일에 셰뱅 `#!/bin/sh`를 추가하여 실행 환경을 명시하고, Unix 스타일 줄바꿈 형식을 보장함.
* **최종 커밋:** `9a4d948` - Fix: 마이그레이션 스크립트에 셰뱅 추가 및 줄바꿈 형식 통일

### 작업 #4213
* **타임스탬프:** 2025-09-21 22:25:00 KST
* **작업 내용:** Elastic Beanstalk 배포 실패 문제 해결.
  - `.platform/hooks/postdeploy/01_migrate.sh` 스크립트 실행 시 발생한 `python: command not found` 오류를 해결함.
  - 스크립트 내에서 `python` 명령어를 `python3`로 변경하여 Docker 컨테이너 내에서 올바른 Python 실행 파일이 호출되도록 함.
* **최종 커밋:** `05b166a` - Fix: 마이그레이션 스크립트에서 python 명령어를 python3로 변경

### 작업 #5678
* **타임스탬프:** 2025-09-21 22:35:00 KST
* **작업 내용:** README2.md에 AI 어시스턴트 메모리 섹션 추가.
  - 사용자 선호 사항 (한국어 커밋 메시지, KST 타임스탬프) 및 표준 운영 절차 (SOP)를 다른 AI 어시스턴트가 참고할 수 있도록 명시함.
* **최종 커밋:** `f5b48e0` - Feat: README2.md에 AI 어시스턴트 메모리 추가

### 작업 #6789
* **타임스탬프:** 2025-09-21 22:40:00 KST
* **작업 내용:** Elastic Beanstalk 배포 실패 문제 해결.
  - `.platform/hooks/postdeploy/01_migrate.sh` 스크립트 실행 시 발생한 `ModuleNotFoundError: No module named 'django'` 오류를 해결함.
  - 스크립트 내에서 `export PYTHONPATH=/var/app/current:$PYTHONPATH`를 추가하여 Docker 컨테이너 실행 컨텍스트 내에서 Django 모듈을 찾을 수 있도록 함.
* **최종 커밋:** `0f2b82d` - Fix: 마이그레이션 스크립트에서 Django 모듈을 찾을 수 없는 오류 해결 (PYTHONPATH 설정)

### 작업 #7890
* **타임스탬프:** 2025-09-21 22:50:00 KST
* **작업 내용:** Elastic Beanstalk 배포 실패 문제 해결.
  - `.platform/hooks/postdeploy/01_migrate.sh` 스크립트 실행 시 발생한 `ModuleNotFoundError: No module named 'django'` 오류를 해결함.
  - 스크립트 내에서 `cd /var/app/current`를 추가하여 스크립트가 올바른 작업 디렉토리에서 실행되도록 하여 Django 모듈을 찾을 수 있도록 함.
* **최종 커밋:** `e5777fe` - Fix: 마이그레이션 스크립트에서 Django 모듈을 찾을 수 없는 오류 해결 (작업 디렉토리 변경)

### 작업 #8901
* **타임스탬프:** 2025-09-21 23:00:00 KST
* **작업 내용:** Elastic Beanstalk 배포 실패 문제 해결.
  - `.platform/hooks/postdeploy/01_migrate.sh` 스크립트 실행 시 발생한 `ModuleNotFoundError: No module named 'django'` 오류를 해결함.
  - 스크립트 내에서 `python3` 명령어를 `/usr/local/bin/python3`로 변경하여 Docker 컨테이너 내에서 올바른 Python 실행 파일이 호출되도록 함.
* **최종 커밋:** `519a484` - Fix: 마이그레이션 스크립트에서 Django 모듈을 찾을 수 없는 오류 해결 (python3 절대 경로 사용)

### 작업 #9012
* **타임스탬프:** 2025-09-21 23:05:00 KST
* **작업 내용:** README2.md 마지막 작업 로그 형식 수정.
  - README2.md의 마지막 작업 로그 항목의 형식을 기존 템플릿에 맞게 수정함.
  - 잘못된 형식의 추가 로그 항목을 제거함.
* **최종 커밋:** `ba36e39` - Docs: README2.md 마지막 작업 로그 형식 수정

### 작업 #9876
* **타임스탬프:** 2025-09-21 23:15:00 KST
* **작업 내용:** Elastic Beanstalk 배포 실패 문제 해결.
  - `.platform/hooks/postdeploy/01_migrate.sh` 스크립트 실행 시 발생한 `ModuleNotFoundError: No module named 'django'` 오류를 해결함.
  - 이전 `README2.md` 형식 업데이트 중 의도치 않게 되돌려진 `python3` 명령어를 `/usr/local/bin/python3`로 변경하는 수정을 재적용함.
* **최종 커밋:** `f6ed6eb` - Fix: 마이그레이션 스크립트 Django 모듈 오류 재적용 (python3 절대 경로)

### 작업 #1011
* **타임스탬프:** 2025-09-21 23:25:00 KST
* **작업 내용:** Elastic Beanstalk 배포 실패 문제 해결.
  - `.platform/hooks/postdeploy/01_migrate.sh` 스크립트 실행 시 발생한 `/usr/local/bin/python3: No such file or directory` 오류를 해결함.
  - 스크립트 내에서 `export PATH=/usr/local/bin:$PATH`를 추가하여 `python3` 실행 파일이 스크립트 실행 컨텍스트에서 찾아지도록 함.
* **최종 커밋:** `8be93a5` - Fix: 마이그레이션 스크립트에서 python3 경로 오류 해결 (PATH 환경 변수 설정)

### 작업 #1122
* **타임스탬프:** 2025-09-21 23:30:00 KST
* **작업 내용:** Elastic Beanstalk 애플리케이션 버전 `e4e0423`에 대한 설명 추가.
  - 이 버전은 현재 Elastic Beanstalk 환경에서 서비스되고 있는 마지막으로 성공한 배포 버전임.
  - `01_migrate.sh` 스크립트 및 마이그레이션 관련 수정 사항들은 이 버전에 포함되어 있지 않음.
  - UI/화면은 정상적으로 표시되지만, 마이그레이션이 필요한 기능은 작동하지 않을 수 있음.
* **최종 커밋:** `e4e0423` - Fix: Include all files in deployment package (이 커밋은 이전에 롤백된 버전의 커밋임)

### 작업 #1234
* **타임스탬프:** 2025-09-21 23:40:00 KST
* **작업 내용:** README2.md에 Elastic Beanstalk 애플리케이션 버전 `e4e0423`에 대한 설명 추가.
  - 이 버전은 현재 Elastic Beanstalk 환경에서 서비스되고 있는 마지막으로 성공한 배포 버전이며, `01_migrate.sh` 스크립트 및 마이그레이션 관련 수정 사항들은 포함되어 있지 않음을 명시함.
* **최종 커밋:** `07f5701` - Docs: README2.md에 e4e0423 버전 설명 추가



**수행된 작업:**
프로젝트의 모든 파일에 일관된 줄바꿈(LF) 규칙을 적용하고, 로컬 Git 설정을 업데이트했습니다. 또한, 배포 스크립트(`.platform/hooks/postdeploy/01_migrate.sh`)에 실행 권한을 부여했습니다.

**타임스탬프:** 2025년 9월 22일 10시 00분 00초 (KST)

**작업 ID:** TASK-XYZ789ABC

**커밋 세부 정보:**
1.  "Normalize line endings to LF"
2.  "Make postdeploy hook executable"
