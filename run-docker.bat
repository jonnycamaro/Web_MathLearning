@echo off
echo Building Docker image...
docker build -t math-learning .

echo.
echo Starting container in interactive mode...
docker run --rm -it -p 3000:3000 math-learning

echo.
echo Container stopped and removed.
