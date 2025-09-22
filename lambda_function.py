import boto3
import zipfile
import io
import requests
import os

s3_client = boto3.client('s3')

RAG_API_ENDPOINT = 'FinAissistWeb-env.eba-jcjiwe5a.ap-northeast-2.elasticbeanstalk.com/api/v1/upload_docs_to_rag'

def lambda_handler(event, context):
    # 1. 이벤트 정보에서 버킷 이름과 파일 경로 가져오기
    bucket_name = event['Records'][0]['s3']['bucket']['name']
    zip_file_key = event['Records'][0]['s3']['object']['key']

    print(f"파일 처리 시작: {bucket_name}/{zip_file_key}")

    try:
        # 2. S3에서 ZIP 파일 다운로드
        response = s3_client.get_object(Bucket=bucket_name, Key=zip_file_key)
        zip_content = response['Body'].read()

        # 3. ZIP 파일 압축 풀기
        with zipfile.ZipFile(io.BytesIO(zip_content)) as z:
            # 4. ZIP 안의 각 PDF 파일 처리
            for filename in z.namelist():
                # macOS에서 생성된 __MACOSX 같은 폴더는 건너뛰기
                if filename.startswith('__') or not filename.endswith('.pdf'):
                    continue

                print(f"PDF 발견: {filename}")
                file_data = z.read(filename)

                # 5. RAG 서버의 업로드 API 호출
                files = {'files': (os.path.basename(filename), file_data, 'application/pdf')}
                try:
                    # 💡 타임아웃을 넉넉하게 5분(300초)으로 설정
                    api_response = requests.post(RAG_API_ENDPOINT, files=files, timeout=300)
                    api_response.raise_for_status() # 200번대 응답이 아니면 에러 발생
                    print(f"  -> 성공적으로 업로드: {filename}")
                except requests.exceptions.RequestException as e:
                    print(f"  -> API 호출 실패: {filename}, 에러: {e}")

    except Exception as e:
        print(f"전체 프로세스 실패: {e}")
        raise e

    return {'statusCode': 200, 'body': f'"{zip_file_key}" 파일 처리 완료'}
