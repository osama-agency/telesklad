#!/bin/bash

# Простое SSH подключение к VPS
VPS_HOST="82.202.131.251"
VPS_USER="deploy"
SSH_KEY="~/.ssh/telesite_deploy"

echo "🔐 Подключаемся к VPS..."
ssh -i $SSH_KEY $VPS_USER@$VPS_HOST
