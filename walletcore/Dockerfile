FROM golang:1.23

WORKDIR /app/

RUN apt-get update && \
    apt-get install -y librdkafka-dev

# Define a variável de ambiente na imagem
ENV DATABASE_URL="mysql://root:password@localhost:3307/wallet"

CMD ["tail", "-f", "/dev/null"]