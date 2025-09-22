import boto3
import os
from botocore.exceptions import NoCredentialsError

def upload_file_to_s3(file_obj, file_name):
    """
    사용자가 업로드한 파일 객체를 S3에 업로드하는 범용 함수
    :param file_obj: 업로드할 파일 객체 (request.FILES['uploaded_file'])
    :param file_name: S3에 저장될 파일 이름
    :return: 파일 URL 또는 None
    """
    # .env 파일에 설정된 값들을 사용
    bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME')
    
    s3_client = boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_S3_REGION_NAME', 'ap-northeast-2')
    )
    
    try:
        # 💡 upload_file 대신 upload_fileobj를 사용!
        # 웹에서 넘어온 파일 객체(in-memory)를 바로 S3로 전송
        s3_client.upload_fileobj(
            file_obj,
            bucket_name,
            file_name  # S3에 저장될 최종 경로 및 파일명
        )
        
        # S3에 올라간 파일의 최종 URL 생성
        file_url = f"https://{bucket_name}.s3.amazonaws.com/{file_name}"
        print(f"S3 업로드 성공: {file_url}")
        return file_url
        
    except NoCredentialsError:
        print("S3 자격 증명 에러: .env 파일을 확인하세요.")
        return None
    except Exception as e:
        print(f"S3 업로드 중 에러 발생: {e}")
        return None