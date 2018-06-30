#!/bin/bash

sed -i "/REST_SERVER/c\  REST_SERVER\:\'\"$REST_SERVER\"\'\," config/prod.env.js
sed -i "/WS_SERVER/c\  WS_SERVER\:\'\"$WS_SERVER\"\'" config/prod.env.js

echo "La variable REST_SERVER se ha establecido a \"$REST_SERVER\""
echo "La variable WS_SERVER se ha establecido a \"$WS_SERVER\""