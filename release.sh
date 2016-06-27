#!/usr/bin/env bash

set -x
set -e

node --version
npm --version



#---------------------------
# if no platform, consider this a local run
#---------------------------
platform=""
if [ "$1" ]
then
  platform=$1
fi

#---------------------------
# Set PATH
#---------------------------
node_mods=$(pwd)/node_modules
if [ $branchPrefix != "release" ]
then
  export ANDROID_HOME=~/Documents/development/adt/sdk
fi
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
if [ $branchPrefix == "release" ]
then
  buildOutputDirectory="${workingDirectory}"
else
  buildOutputDirectory="${workingDirectory}/release"
fi
#iOS
PRIVATE_KEY_FILE="provisioning/AppStore.p12"
PRIVATE_KEY_PASSPHRASE="`cat provisioning/AppStore-Passphrase.txt`"
appleProvisionId="`cat provisioning/AppStore-ProvisionId.txt`"
buildScheme="${appName}"
archiveFile="${appName}.xcarchive"
appFile="${appName}.app"
ipaFile="${appName}.ipa"
binaryFileNameIOS="${ipaFile}"
#Android
KEYSTORE="provisioning/GooglePlay.keystore"
KEYSTORE_PASSPHRASE="`cat provisioning/GooglePlay-Passphrase.txt`"
KEYSTORE_ALIAS="`cat provisioning/GooglePlay-PrivateAlias.txt`"
apkFileUnsigned="android-armv7-release-unsigned.apk"
x86apkFileUnsigned="android-x86-release-unsigned.apk"
apkFileSigned="android-armv7-release-signed.apk"
x86apkFileSigned="android-x86-release-signed.apk"
binaryFileNameAndroid="cordova/platforms/android/build/outputs/apk/${apkFileUnsigned}"
x86binaryFileNameAndroid="cordova/platforms/android/build/outputs/apk/${x86apkFileUnsigned}"
UNSIGNED="${buildOutputDirectory}/${apkFileUnsigned}"
x86UNSIGNED="${buildOutputDirectory}/${x86apkFileUnsigned}"
SIGNED="${buildOutputDirectory}/${apkFileSigned}"
x86SIGNED="${buildOutputDirectory}/${x86apkFileSigned}"




cordova --version
grunt build:production


#---------------------------
# Do Web specific things
#---------------------------
if [ "$platform" == "web" -o "$platform" == "www" -o "$platform" == "" ]
then
  (cd build/www && zip -r -X "${buildOutputDirectory}/${releaseFileName}.zip" *)
fi


#---------------------------
# Do iOS specific things
#---------------------------
if [ "$platform" == "ios" -o "$platform" == "" ]
then
  echo "Installing Provisioning Profile"
  mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles/
  cp provisioning/*.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/

  echo "Importing private key";
  echo $PRIVATE_KEY_PASSPHRASE

  security import ${PRIVATE_KEY_FILE} -P "${PRIVATE_KEY_PASSPHRASE}" -k ~/Library/Keychains/login.keychain -A

  binaryFileName="${ipaFile}"

  cordova --version
  (cd cordova/platforms/ios/ && xcodebuild -scheme "$buildScheme" -sdk iphoneos archive -archivePath "$archiveFile" PROVISIONING_PROFILE=$appleProvisionId)
  (cd cordova/platforms/ios/ && xcodebuild -exportArchive -exportOptionsPlist "${workingDirectory}/provisioning/AppStoreExportOptions.plist" -archivePath "$archiveFile" -exportPath "${buildOutputDirectory}" CODE_SIGN_IDENTITY="$codesignIdentity" PROVISIONING_PROFILE=$appleProvisionId)
  mv "${buildOutputDirectory}/${ipaFile}" "${buildOutputDirectory}/${releaseFileName}.ipa"
fi


#---------------------------
# Do Android specific things
#---------------------------
if [ "$platform" == "android" -o "$platform" == "" ]
then
  (cd cordova/platforms/android/ &&  android update project -p ./ -t "android-23" -s)
  (cd cordova/platforms/android/CordovaLib/ &&  android update project -p ./ -t "android-23" -s)

  cordova --version
  mkdir -p cordova/platforms/android/assets
  (cd cordova && cordova build android --release)

  mv ${binaryFileNameAndroid} ${buildOutputDirectory}/${apkFileUnsigned}
  mv ${x86binaryFileNameAndroid} ${buildOutputDirectory}/${x86apkFileUnsigned}


  jarsigner -verbose -tsa http://timestamp.digicert.com -keystore ${KEYSTORE} -storepass ${KEYSTORE_PASSPHRASE} ${UNSIGNED} ${KEYSTORE_ALIAS}
  $ANDROID_BUILD_TOOLS/zipalign -v 4 ${buildOutputDirectory}/${apkFileUnsigned} ${buildOutputDirectory}/${releaseFileName}-armv7.apk
  rm ${buildOutputDirectory}/${apkFileUnsigned}

  jarsigner -verbose -tsa http://timestamp.digicert.com -keystore ${KEYSTORE} -storepass ${KEYSTORE_PASSPHRASE} ${x86UNSIGNED} ${KEYSTORE_ALIAS}
  $ANDROID_BUILD_TOOLS/zipalign -v 4 ${buildOutputDirectory}/${x86apkFileUnsigned} ${buildOutputDirectory}/${releaseFileName}-x86.apk
  rm ${buildOutputDirectory}/${x86apkFileUnsigned}
fi
