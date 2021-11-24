NAME := atlassian-lonely-devs
CAPROVER_APP_NAME := atlassian-lonely-devs

TAG    := $(shell git log -1 --pretty=%h)
IMG    := ${NAME}:${TAG}
LATEST := ${NAME}:latest

build:
	@status=$$(git status --porcelain); \
	if test "x$${status}" = x; then \
		docker build . -t ${IMG}; \
		docker tag ${IMG} ${LATEST}; \
	else \
		echo Repository is dirty; \
		false; \
	fi
	
push: pushLatest pushTag

pushTag:
	@docker image push ${IMG}

pushLatest:
	@docker image push ${NAME}

deploy: build push
	@caprover deploy -a ${CAPROVER_APP_NAME} -i ${IMG}

deployLatest:
	@caprover deploy -a ${CAPROVER_APP_NAME} -i ${NAME}
