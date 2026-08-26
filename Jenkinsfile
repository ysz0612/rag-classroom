pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
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
                withCredentials([
                    file(
                        credentialsId: 'rag-project-env',
                        variable: 'ENV_FILE'
                    )
                ]) {
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
                sh '''
                    docker compose up \
                        -d \
                        --build \
                        --remove-orphans
                '''
            }
        }

        stage('Health check') {
            steps {
                sh '''
                    for i in $(seq 1 30); do
                        if docker compose exec -T backend \
                            python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')" \
                            >/dev/null 2>&1
                        then
                            echo "Backend health check succeeded."
                            docker compose ps
                            exit 0
                        fi

                        echo "Waiting for backend... ($i/30)"
                        sleep 2
                    done

                    echo "Backend health check failed."
                    docker compose ps
                    docker compose logs --tail=100 backend
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo 'RAG Classroom deployment succeeded.'
        }

        failure {
            echo 'RAG Classroom deployment failed.'
        }

        always {
            sh 'rm -f .env'
        }
    }
}