FN_NAME = "NewsAggregator-CoreEnricherF4F2E353-baUFTVvQGsrh"
FN_ALIAS = "live"
FN_REGION = "eu-central-1"
DIST_FOLDER = ".aws-sam/build/EnricherFn"

artifact.zip: requirements.txt
	sam build --use-container --cached
	cd ${DIST_FOLDER} && zip -r ../../../artifact.zip *

requirements.txt:
	poetry export -o requirements.txt

build: artifact.zip

deploy:
	function_version=$$(aws lambda update-function-code --function-name ${FN_NAME} --zip-file fileb://artifact.zip --publish --region eu-central-1 --output text --query 'Version'); \
	aws lambda update-alias --function-name ${FN_NAME} --name ${FN_ALIAS} --function-version $${function_version};

clean:
	rm -f requirements.txt
	rm -f artifact.zip
