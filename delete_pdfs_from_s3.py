import boto3
import os
import time
from dotenv import load_dotenv
from botocore.exceptions import NoCredentialsError

# .env 파일에서 AWS 접속 정보 로드
load_dotenv()

# --- 💡 1. 여기만 너의 상황에 맞게 수정! ---
# S3 버킷 이름 (.env 파일에서 자동으로 읽어옴)
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')

# 특정 폴더 안에 있는 PDF만 지우고 싶으면 여기에 폴더 이름을 적어줘.
# 버킷 전체에서 PDF를 찾으려면 빈 문자열('')로 둬.
TARGET_FOLDER = '' # 예: 'user-documents'

# ⚠️⚠️⚠️ 안전 장치! True로 두면 삭제하지 않고 목록만 보여줌 ⚠️⚠️⚠️
# 실제로 삭제하려면 반드시 False로 바꿔야 해!
DRY_RUN = True
# ---------------------------------------------


def delete_all_pdfs_in_bucket():
    """S3 버킷에서 모든 PDF 파일을 삭제하는 스크립트"""
    
    if not AWS_STORAGE_BUCKET_NAME:
        print("에러: .env 파일에 AWS_STORAGE_BUCKET_NAME이 설정되지 않았습니다.")
        return

    print(f"'{AWS_STORAGE_BUCKET_NAME}' 버킷을 스캔합니다...")
    if TARGET_FOLDER:
        print(f"대상 폴더: '{TARGET_FOLDER}'")

    try:
        s3 = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_S3_REGION_NAME', 'ap-northeast-2')
        )

        # 1. 삭제할 PDF 파일 목록 수집
        pdfs_to_delete = []
        paginator = s3.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=AWS_STORAGE_BUCKET_NAME, Prefix=TARGET_FOLDER)

        for page in pages:
            if 'Contents' in page:
                for obj in page['Contents']:
                    if obj['Key'].lower().endswith('.pdf'):
                        pdfs_to_delete.append({'Key': obj['Key']})
        
        if not pdfs_to_delete:
            print("삭제할 PDF 파일을 찾지 못했습니다.")
            return

        print(f"\n총 {len(pdfs_to_delete)}개의 PDF 파일을 찾았습니다.")

        # 2. Dry Run (예행연습) 모드 실행
        if DRY_RUN:
            print("--- DRY RUN 모드입니다. 파일이 실제로 삭제되지 않습니다. ---")
            for item in pdfs_to_delete:
                print(f"  - [삭제 예정] {item['Key']}")
            print("\n실제로 삭제하려면 스크립트 상단의 DRY_RUN 변수를 False로 변경하세요.")
            return

        # 3. 실제 삭제 모드 실행
        print("\n---!!! 실제 삭제 모드입니다 !!!---")
        print("5초 후에 파일 삭제를 시작합니다. 취소하려면 지금 Ctrl+C를 누르세요.")
        
        for i in range(5, 0, -1):
            print(f"{i}...")
            time.sleep(1)
        
        print("삭제를 시작합니다...")
        
        # S3는 한 번에 1000개까지 삭제 가능하므로, 1000개씩 나눠서 처리
        for i in range(0, len(pdfs_to_delete), 1000):
            chunk = pdfs_to_delete[i:i + 1000]
            response = s3.delete_objects(
                Bucket=AWS_STORAGE_BUCKET_NAME,
                Delete={'Objects': chunk}
            )
            
            if 'Errors' in response:
                print("삭제 중 일부 파일에서 오류가 발생했습니다:")
                for error in response['Errors']:
                    print(f"  - 파일: {error['Key']}, 에러: {error['Message']}")
            
        print(f"\n총 {len(pdfs_to_delete)}개의 PDF 파일 삭제가 완료되었습니다.")

    except NoCredentialsError:
        print("에러: AWS 자격 증명을 찾을 수 없습니다. .env 파일이 올바르게 설정되었는지 확인하세요.")
    except Exception as e:
        print(f"알 수 없는 오류가 발생했습니다: {e}")


if __name__ == "__main__":
    delete_all_pdfs_in_bucket()