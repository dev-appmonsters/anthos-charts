SHELL=/bin/bash

export CURRENT_CONTEXT ?= $$(kubectl config current-context)

validate:
ifndef values
$(error `values` argument is not provided -> example: make deploy values=<path to secrets values file>)
endif
	./validator/bin/validate.js validate -f ${values} -s schema.yaml

confirm:
	@echo "============================================You are going to deploy secrets to=========================="
	@echo -e "\e[31m                       ${CURRENT_CONTEXT}\e[0m"
	@echo "========================================================================================================"
	@echo -n "Are you sure? " && read ans && [ $$ans == y ]

upgrade-helm:
	helm upgrade anthos-secrets --install . -f ${values}

deploy: validate confirm upgrade-helm
	@echo "secrets deployed in ${CURRENT_CONTEXT}"

setup:
	@cd validator && npm install

.PHONY: update
