WIN64_CC=x86_64-w64-mingw32-gcc
Darwin_CC=clang

.PHONY: clean all

all: mac-app windows-app

pkged-darwin:
	cp -r ../dist .
	$(shell go env GOPATH)/bin/pkger
	rm -rf dist

pkged-windows:
	cp -r ..\dist .
	$(shell go env GOPATH)\bin\pkger
	rm -rf dist

mongood-darwin: pkged-darwin
	CC=$(Darwin_CC) CGO_ENABLED=1 GOOS=darwin GOARCH=amd64 go build -o mongood-darwin

mongood-windows: pkged-windows
	CC=$(WIN64_CC) CGO_ENABLED=1 GOOS=windows GOARCH=amd64 go build -o mongood-windows

# packaging mongood.app
mac-app: mongood-darwin
	CC=$(Darwin_CC) CGO_ENABLED=1 GOOS=darwin GOARCH=amd64 $(shell go env GOPATH)/bin/fyne package -os darwin -icon ../assets/mongood.png -release --executable ./mongood-darwin
	cp ../assets/Info.plist mongood.app/Contents/Info.plist 

# packaging mongood.exe
windows-app: mongood-windows
	CC=$(WIN64_CC) CGO_ENABLED=1 GOOS=windows GOARCH=amd64 $(shell go env GOPATH)\bin\fyne package -os windows -icon ..\assets\mongood.png -release --executable mongood-windows

clean:
	rm -rf pkged.go
	rm -rf mongood-windows mongood-darwin
	rm -rf mongood.app mongood.exe fyne.syso
