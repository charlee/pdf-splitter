IMAGE_TAG := odacharlee/pdf-splitter

.PHONY: build

all:
	docker build -t $(IMAGE_TAG):latest .