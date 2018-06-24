#!/bin/bash

sed -i "/REST_SERVER/c\  REST_SERVER\:\'\"$REST_SERVER\"\'" config/prod.env.js

echo "La variable REST_SERVER se ha establecido a \"$REST_SERVER\""