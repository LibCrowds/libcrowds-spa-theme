#!/usr/bin/env bash

SETTINGS="https://github.com/LibCrowds/libcrowds-frontend-settings"

# Configure site
rm siteConfig.js
rm -r custom
mkdir custom
git clone $SETTINGS src/custom/settings
echo "module.exports = require('@/custom/settings/siteConfig.js')" >> siteConfig.js
