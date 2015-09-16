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
  echo "Usage: ./bamboobuild.sh [platform (optional)] [environment (optional)]"
  echo "ex: ./bamboobuild.sh app ios production \"1.2.4\""
  exit 1
fi

set -x
set -e




#---------------------------
#***************************
# App Specific Configuration
#***************************
#---------------------------
appName="app"
hockeyAppId="###"
hockeyApiToken="###"
hockeyAppTeams="###"
serverAddress="###"
remoteFolder="##"
userName="##"
shouldUpload=false
shouldGenerateIcons=false
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
# Set PATH
#---------------------------
node_mods=$(pwd)/node_modules
export PATH=/usr/local/bin/:$node_mods/grunt-cli/bin:$node_mods/bower/bin:$node_mods/cordova/bin:$PATH


#---------------------------
# Set Variables
#---------------------------
#General
branchName="${bamboo_planRepository_branchName}"
semVerBranchName="${branchName//[^0-9a-zA-Z-]/-}"
shortHash="$(git rev-parse --short HEAD)"
buildPlanName="${bamboo_buildPlanName}"
buildNumber="${bamboo_buildNumber}"
revisionNumber="${bamboo_planRepository_revision}"
slug="${appName}-${platform}"
buildTimeStamp="${bamboo_buildTimeStamp}"
hockeyMessage="${slug}.${branchName}.${buildNumber}"
workingDirectory="${bamboo_build_working_directory}"
buildString="${branchName}-${buildNumber}"
#iOS
buildScheme="${appName}"
archiveFile="${appName}.xcarchive"
appFile="${appName}.app"
ipaFile="${appName}.ipa"
binaryFileName="${ipaFile}"
codesignIdentity="${bamboo_codesignIdentity}"
appleProvisionId="${bamboo_APPLE_PROVISION_ID}"
#Android
apkFile="${appName}.apk"
#web
buildFolder="${appName}-${buildNumber}-${revisionNumber}-${buildTimeStamp}"



#---------------------------
# generate icons
#---------------------------
if [ $shouldGenerateIcons == true ]
then
  ./icongen.sh ${appName} ${platform} ${env} ${buildString}
else
  echo "Bypassing Icon Generation"
fi



#---------------------------
# Install dependencies
#---------------------------
npm install


#---------------------------
# Inject build info into project
#---------------------------
echo "{\"name\":\"$buildPlanName\",\"number\":\"$buildNumber\",\"revision\":\"$revisionNumber\",\"slug\":\"$slug\",\"branchname\":\"$branchName\",\"shorthash\":\"$shortHash\",\"timestamp\":\"$buildTimeStamp\"}" > version.json
cat version.json
cp version.json src/www/assets/version.json


#---------------------------
# Do iOS specific things
#---------------------------
if [ "$platform" == "ios" ]
then

  binaryFileName="${ipaFile}"

  find . -name "*.mobileprovision" | xargs -I{} cp "{}" "/var/mutualmobile/Library/MobileDevice/Provisioning Profiles"
  grunt build:$env:ios
  (cd cordova/platforms/ios/ && xcodebuild -scheme "$buildScheme" -sdk iphoneos archive -archivePath "$archiveFile" CODE_SIGN_IDENTITY="$codesignIdentity" PROVISIONING_PROFILE=$appleProvisionId)
  (cd cordova/platforms/ios/ && xcrun -sdk iphoneos PackageApplication -v "${archiveFile}/Products/Applications/${appFile}" -o "${workingDirectory}/${ipaFile}" --sign "$codesignIdentity")

fi


#---------------------------
# Do Android specific things
#---------------------------
if [ "$platform" == "android" ]
then

  binaryFileName="${apkFile}"

  (cd cordova/platforms/android/ &&  android update project -p ./ -t "android-19" -s)
  (cd cordova/platforms/android/CordovaLib/ &&  android update project -p ./ -t "android-19" -s)
  #(cd cordova/platforms/android/com.urbanairship.phonegap.PushNotification/SleepIQ-google-play-services/ &&  android update project -p ./ -t "android-19" -s)
  #(cd cordova/platforms/android/com.urbanairship.phonegap.PushNotification/SleepIQ-urbanairship-lib/ &&  android update project -p ./ -t "android-19" -s)

  grunt build:$env:android
  (cd cordova/platforms/android/ && cordova build android --release)

fi


if [ $shouldUpload == false ]
then
  echo "Bypassing Upload"
  exit
fi


#---------------------------
# Upload to Hockey App
#---------------------------
if [ "$platform" == "ios" -o "$platform" == "android" ]
then

  curl -X POST https://rink.hockeyapp.net/api/2/apps/$hockeyAppId/app_versions \
    -H "X-HockeyAppToken: $hockeyApiToken" \
    -F status=2 \
    -F "notes=$hockeyMessage" \
    -F notes_type=1 \
    -F "ipa=@$binaryFileName" \
    -F commit_sha=$revisionNumber \
    -F "teams=$hockeyAppTeams"

fi


#---------------------------
# Upload to Web Server
#---------------------------
if [ "$platform" == "web" ]
then

  scp -r ./build/www ${userName}@${serverAddress}:${remoteFolder}/${buildFolder}

fi


