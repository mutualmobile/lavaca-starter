#!/usr/bin/env bash

#---------------------------
# For iOS, this build script assumes that your iOS project
# has a target build scheme that is shared and 
# that in your Build Settings, "Code Signing Resource Rules Path" 
# is set to $(SDKROOT)/ResourceRules.plist
#---------------------------

EXPECTED_ARGS=2
if [ $# -lt $EXPECTED_ARGS ]
then
  echo "Usage: ./publishbuild.sh [platform (optional)] [environment (optional)]"
  echo "ex: ./publishbuild.sh ios production"
  exit 1
fi



#---------------------------
# Disallow publish if changes are uncommitted
#---------------------------
git update-index -q --ignore-submodules --refresh
err=0

# Disallow unstaged changes in the working tree
if ! git diff-files --quiet --ignore-submodules --
then
    echo >&2 "cannot $1: you have unstaged changes."
    git diff-files --name-status -r --ignore-submodules -- >&2
    err=1
fi

# Disallow uncommitted changes in the index
if ! git diff-index --cached --quiet HEAD --ignore-submodules --
then
    echo >&2 "cannot $1: your index contains uncommitted changes."
    git diff-index --cached --name-status -r --ignore-submodules HEAD -- >&2
    err=1
fi

if [ $err = 1 ]
then
    echo >&2 "Please commit or stash them."
    exit 1
fi




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
shouldGenerateIcons=true
#---------------------------
#***************************
# End App Specific Configuration
#***************************
#---------------------------




#---------------------------
# Get Arguments
#---------------------------
platform="web"
env="production"

if [ "$1" ]
then
  platform=$1
fi

if [ "$2" ]
then
  env=$2
fi


#---------------------------
# Set Variables
#---------------------------
#General
branchName="$(git rev-parse --abbrev-ref HEAD)"
shortHash="$(git rev-parse --short HEAD)"
hockeyMessage="${appName}-${env}-${branchName}-${shortHash}"
buildString="${shortHash}"
#iOS
buildScheme="${appName}"
archiveFile="${appName}.xcarchive"
appFile="${appName}.app"
ipaFile="${appName}-${shortHash}.ipa"
binaryFileName="${ipaFile}"
releaseFolder="$PWD"
otafile="_source-ota-manifest.plist"
otafiletmp="ota-tmp.plist"
otafileout="${appName}-${shortHash}.plist"
#Android
apkFile="${appName}-${shortHash}.apk"
#web
buildFolder="${appName}-${env}-${branchName}-${shortHash}"



#---------------------------
# generate icons
#---------------------------
if [ $shouldGenerateIcons == true ]
then
  ./icongen.sh ${appName} ${platform} ${env} ${buildString}
else
  echo "Bypassing Icon Gen"
fi



#---------------------------
# Do iOS specific things
#---------------------------
if [ "$platform" == "ios" ]
then

  binaryFileName="${ipaFile}"
  hockeyAppId="${hockeyAppIdiOS}"

  cordova --version
  grunt build:$env:ios
  #(cd cordova/platforms/ios/ && xcodebuild -scheme "$buildScheme" -sdk iphoneos archive -archivePath "$archiveFile" CODE_SIGN_IDENTITY="$codesignIdentity" PROVISIONING_PROFILE=$appleProvisionId)
  (cd cordova/platforms/ios/ && xcodebuild -scheme "$buildScheme" -sdk iphoneos archive -archivePath "$archiveFile")
  #(cd cordova/platforms/ios/ && xcrun -sdk iphoneos PackageApplication -v "${archiveFile}/Products/Applications/${appFile}" -o "${releaseFolder}/${ipaFile}" --sign "$codesignIdentity")
  (cd cordova/platforms/ios/ && xcrun -sdk iphoneos PackageApplication -v "${archiveFile}/Products/Applications/${appFile}" -o "${releaseFolder}/${ipaFile}")

fi


#---------------------------
# Do Android specific things
#---------------------------
if [ "$platform" == "android" ]
then

  binaryFileName="${apkFile}"
  hockeyAppId="${hockeyAppIdAndroid}"

  (cd cordova/platforms/android/ &&  android update project -p ./ -t "android-21" -s)
  (cd cordova/platforms/android/CordovaLib/ &&  android update project -p ./ -t "android-21" -s)
  #(cd cordova/platforms/android/com.urbanairship.phonegap.PushNotification/SleepIQ-google-play-services/ &&  android update project -p ./ -t "android-21" -s)
  #(cd cordova/platforms/android/com.urbanairship.phonegap.PushNotification/SleepIQ-urbanairship-lib/ &&  android update project -p ./ -t "android-21" -s)

  cordova --version
  mkdir -p cordova/platforms/android/assets
  grunt build:$env:android
  (cd cordova && cordova build android --release)

fi



#---------------------------
# Upload to Hockey App
#---------------------------
if [ "$platform" == "ios" -o "$platform" == "android" ]
then

  #---------------------------
  # Upload IPA
  #---------------------------
  resource="/${s3Bucket}/${binaryFileName}"
  contentType="application/octet-stream"
  dateValue=`date "+%a, %d %h %Y %T %z"`
  acl="x-amz-acl:public-read"
  stringToSign="PUT\n\n${contentType}\n${dateValue}\n${acl}\n${resource}"
  signature=`echo -en ${stringToSign} | openssl sha1 -hmac ${s3Secret} -binary | base64`
  curl -X PUT -T "${binaryFileName}" \
    -H "Host: ${s3Bucket}.s3.amazonaws.com" \
    -H "Date: ${dateValue}" \
    -H "${acl}" \
    -H "Content-Type: ${contentType}" \
    -H "Authorization: AWS ${s3Key}:${signature}" \
    https://${s3Bucket}.s3.amazonaws.com/${binaryFileName}


  #---------------------------
  # Update OTA plist
  #---------------------------
  if [ -e ".build-config" ]
  then
    source ".build-config"
  fi
  cp ${otafile} ${otafiletmp}

  old="__IPA_FILE__"
  new="https:\/\/${s3Bucket}.s3.amazonaws.com\/${binaryFileName}"
  sed "s/${old}/${new}/g" ${otafiletmp} > ${otafileout}
  mv ${otafileout} ${otafiletmp}

  old="__ICON_FILE__"
  new="https:\/\/${s3Bucket}.s3.amazonaws.com\/${appName}_icon.png"
  sed "s/${old}/${new}/g" ${otafiletmp} > ${otafileout}
  mv ${otafileout} ${otafiletmp}

  old="__BUNDLE_IDENTIFIER__"
  new="${bundleId}"
  sed "s/${old}/${new}/g" ${otafiletmp} > ${otafileout}
  mv ${otafileout} ${otafiletmp}

  old="__BUILD_VERSION__"
  new="${timeStampVersionCode}"
  sed "s/${old}/${new}/g" ${otafiletmp} > ${otafileout}
  mv ${otafileout} ${otafiletmp}

  old="__SUBTITLE__"
  new="${version} (${timeStampVersionCode})"
  sed "s/${old}/${new}/g" ${otafiletmp} > ${otafileout}
  mv ${otafileout} ${otafiletmp}

  old="__APP_NAME__"
  new="${appName}"
  sed "s/${old}/${new}/g" ${otafiletmp} > ${otafileout}

  rm ${otafiletmp}


  #---------------------------
  # Upload plist
  #---------------------------
  resource="/${s3Bucket}/${otafileout}"
  contentType="text/xml"
  dateValue=`date "+%a, %d %h %Y %T %z"`
  acl="x-amz-acl:public-read"
  stringToSign="PUT\n\n${contentType}\n${dateValue}\n${acl}\n${resource}"
  signature=`echo -en ${stringToSign} | openssl sha1 -hmac ${s3Secret} -binary | base64`
  curl -X PUT -T "${otafileout}" \
    -H "Host: ${s3Bucket}.s3.amazonaws.com" \
    -H "Date: ${dateValue}" \
    -H "${acl}" \
    -H "Content-Type: ${contentType}" \
    -H "Authorization: AWS ${s3Key}:${signature}" \
    https://${s3Bucket}.s3.amazonaws.com/${otafileout}



fi







git clean -df && git checkout -- .
