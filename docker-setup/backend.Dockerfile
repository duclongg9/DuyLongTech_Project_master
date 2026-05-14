FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN apt-get update && apt-get install -y dos2unix && \
    dos2unix mvnw && \
    chmod +x mvnw
RUN ./mvnw dependency:go-offline -B
COPY src ./src
ENTRYPOINT ["./mvnw", "spring-boot:run", "-DskipTests"]
