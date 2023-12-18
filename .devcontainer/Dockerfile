FROM alpine:latest

RUN set -eux; \
    apk add -U git make npm openssh-client py3-build py3-pip; \
    git config --global core.autocrlf input; \
    git config --global color.ui auto; \
    git config --global init.defaultBranch main
