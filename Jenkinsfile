pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Load environment') {
            steps {
                withCredentials([file(credentialsId: 'rag-project-env', variable: 'ENV_FILE')]) {
                    sh 'cp "$ENV_FILE" .env'
                }
            }
        }

        stage('Validate') {
            steps {
                sh 'docker compose config --quiet'
            }
        }

        stage('Build and deploy') {
            steps {
                sh 'docker compose up -d --build --remove-orphans'
            }
        }

        stage('Health check') {
            steps {
                sh '''
                    for i in $(seq 1 30); do
                      if curl -fsS http://127.0.0.1:8000/health >/dev/null; then
                        exit 0
                      fi
                      sleep 2
                    done
                    docker compose ps
                    docker compose logs --tail=100 backend
                    exit 1
                '''
            }
        }
    }

    post {
        always {
            sh 'rm -f .env'
        }
    }
}

