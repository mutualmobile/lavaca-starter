#!/usr/bin/env bash

set -x
set -e

node --version
npm --version

#---------------------------
# Set PATH
#---------------------------
node_mods=$(pwd)/node_modules
export ANDROID_HOME=~/Documents/development/adt/sdk
export ANDROID_BUILD_TOOLS=$ANDROID_HOME/build-tools/"23.0.0"/
export PATH=/usr/local/bin/:$node_mods/grunt-cli/bin:$node_mods/bower/bin:$node_mods/cordova/bin:$PATH
export PATH=$ANDROID_HOME/build-tools/"23.0.0":$PATH
export PATH=$ANDROID_HOME/tools:$PATH
export PATH=$ANDROID_HOME/platform-tools:$PATH


#---------------------------
# Install dependencies
#---------------------------
# npm install



#---------------------------
#***************************
# App Specific Configuration
#***************************
#---------------------------
grunt shell:setShellVariables
if [ -e ".build-config" ]
then
  source ".build-config"
else
  echo "variable retrieval failed"
  exit 1
fi



#---------------------------
# Set Variables
#---------------------------

#General
workingDirectory="$(pwd)"
shortHash="$(git rev-parse --short HEAD)"
slug="${appName}-${platform}"
releaseFileName="${appName}-${version}"
#iOS
PRIVATE_KEY_FILE="provisioning/xxxxxx.p12"
PRIVATE_KEY_PASSPHRASE="`cat provisioning/AppStore-Passphrase.txt`"
codesignIdentity="`cat provisioning/AppStore-CodesignIdentity.txt`"
appleProvisionId="`cat provisioning/AppStore-ProvisionId.txt`"
buildScheme="${appName}"
archiveFile="${appName}.xcarchive"
appFile="${appName}.app"
ipaFile="${appName}.ipa"
binaryFileNameIOS="${ipaFile}"
#Android
KEYSTORE="provisioning/xxxxxx.keystore"
KEYSTORE_PASSPHRASE="`cat provisioning/GooglePlay-Passphrase.txt`"
UNSIGNED="${workingDirectory}/release/${apkFileUnsigned}"
SIGNED="${workingDirectory}/release/${apkFileSigned}"
KEYSTORE_ALIAS="`cat provisioning/GooglePlay-PrivateAlias.txt`"
apkFileUnsigned="android-release-unsigned.apk"
apkFileSigned="android-release-signed.apk"
binaryFileNameAndroid="cordova/platforms/android/build/outputs/apk/${apkFileUnsigned}"




cordova --version
grunt build:production


#---------------------------
# Do Web specific things
#---------------------------
(cd build/www && zip -r -X "${workingDirectory}/release/${releaseFileName}.zip" *)


#---------------------------
# Do iOS specific things
#---------------------------

echo "Installing Provisioning Profile"
mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles/
cp certificates/*.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/

echo "Importing private key";
echo $PRIVATE_KEY_PASSPHRASE

security import ${PRIVATE_KEY_FILE} -P "${PRIVATE_KEY_PASSPHRASE}" -k ~/Library/Keychains/login.keychain -A

binaryFileName="${ipaFile}"

cordova --version
(cd cordova/platforms/ios/ && xcodebuild -scheme "$buildScheme" -sdk iphoneos archive -archivePath "$archiveFile" CODE_SIGN_IDENTITY="$codesignIdentity" PROVISIONING_PROFILE=$appleProvisionId)
(cd cordova/platforms/ios/ && xcodebuild -exportArchive -exportOptionsPlist "${workingDirectory}/provisioning/AppStoreExportOptions.plist" -archivePath "$archiveFile" -exportPath "${workingDirectory}/release" CODE_SIGN_IDENTITY="$codesignIdentity" PROVISIONING_PROFILE=$appleProvisionId)
mv "${workingDirectory}/release/${ipaFile}" "${workingDirectory}/release/${releaseFileName}.ipa"

#---------------------------
# Do Android specific things
#---------------------------

(cd cordova/platforms/android/ &&  android update project -p ./ -t "android-21" -s)
(cd cordova/platforms/android/CordovaLib/ &&  android update project -p ./ -t "android-21" -s)

cordova --version
mkdir -p cordova/platforms/android/assets
(cd cordova && cordova build android --release)

mv ${binaryFileNameAndroid} ${workingDirectory}/release/${apkFileUnsigned}


jarsigner -verbose -tsa http://timestamp.digicert.com -keystore ${KEYSTORE} -storepass ${KEYSTORE_PASSPHRASE} ${UNSIGNED} ${KEYSTORE_ALIAS}
$ANDROID_BUILD_TOOLS/zipalign -v 4 ${workingDirectory}/release/${apkFileUnsigned} ${workingDirectory}/release/${releaseFileName}.apk
rm ${workingDirectory}/release/${apkFileUnsigned}

