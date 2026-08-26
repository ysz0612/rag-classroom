# RAG Classroom 로컬 Docker + Jenkins 실행

## 1. 환경 변수

프로젝트 루트에서 다음 명령을 실행합니다.

```powershell
Copy-Item .env.example .env
notepad .env
```

`.env`에는 실제 비밀번호와 API 키를 입력합니다. 이 파일은 `.gitignore`에 의해 GitHub에 올라가지 않습니다.  
`.env.example`에는 값의 **이름과 형식만** 남기며 실제 비밀값을 넣지 않습니다.

최소한 다음 값은 반드시 변경하세요.

- `POSTGRES_PASSWORD`
- `NEO4J_PASSWORD` (8자 이상)
- `JWT_SECRET_KEY`
- `OPENAI_API_KEY`

JWT 비밀키는 PowerShell에서 다음처럼 만들 수 있습니다.

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

## 2. 첫 실행

```powershell
docker compose up -d --build
docker compose --profile init run --rm init-data
```

두 번째 명령은 CSV 적재, 한국어 상품 번역, 상품·수업 지식 임베딩, Neo4j 그래프 생성을 수행합니다.  
상품 번역은 최초 한 번 오래 걸리고 OpenAI API 비용이 발생합니다. 이미 번역·임베딩이 들어 있는 기존 PostgreSQL을 사용한다면 이 작업 대신 DB 백업을 복원하는 편이 빠릅니다.

초기화가 끝나면:

- 웹: http://localhost:8088
- API 문서: http://127.0.0.1:8000/docs
- Neo4j Browser: http://127.0.0.1:7474

상태 확인:

```powershell
docker compose ps
docker compose logs -f backend
```

종료와 재시작:

```powershell
docker compose stop
docker compose start
```

데이터를 유지한 채 컨테이너만 내리기:

```powershell
docker compose down
```

주의: `docker compose down -v`는 데이터베이스 볼륨까지 삭제하므로 실행하지 마세요.

## 3. GitHub 저장소

```powershell
git init
git add .
git commit -m "Configure Docker and Jenkins"
git branch -M main
git remote add origin https://github.com/본인계정/rag-classroom.git
git push -u origin main
```

`.env`, `node_modules`, `.venv`, `dist`는 커밋되지 않습니다.

## 4. Jenkins 실행

프로젝트 루트에서:

```powershell
docker compose -f jenkins/docker-compose.jenkins.yml up -d --build
docker exec rag-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

브라우저에서 http://localhost:8080 을 열고 초기 설정을 완료합니다.

Jenkins에서 다음을 설정합니다.

1. **Manage Jenkins → Credentials → System → Global credentials**
2. **Secret file**을 선택하고 로컬의 완성된 `.env` 파일을 업로드
3. ID를 정확히 `rag-project-env`로 지정
4. 새 Pipeline 작업 생성
5. Pipeline definition은 **Pipeline script from SCM**
6. Git 저장소 URL과 브랜치 `*/main`, Script Path `Jenkinsfile` 지정

이후 Build Now를 누르면 Jenkins가 Git 소스를 받아 Docker 이미지를 다시 만들고 서비스를 교체합니다.

## 5. 환경 변수의 역할

| 파일 | Git 저장 | 용도 |
|---|---:|---|
| `.env.example` | 예 | 필요한 변수 목록과 예시 |
| `.env` | 아니요 | 실제 DB 비밀번호·JWT 키·OpenAI 키 |
| Jenkins Secret file | Jenkins 내부 | 배포 시 임시로 `.env` 제공 |

프론트엔드는 Docker 배포 시 Nginx가 `/api` 요청을 백엔드로 전달하므로 별도의 운영 서버 주소를 하드코딩하지 않습니다.

