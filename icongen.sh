#!/usr/bin/env bash

#---------------------------
# This script assumes that ImageMagick is installed with Ghostscript
# and the convert command is accessible via the $PATH variable
#
# If not, these should be easily installed with:
# brew install imagemagick
# brew install ghostscript
#---------------------------




#---------------------------
#***************************
# App Specific Configuration
#***************************
#---------------------------
buildNumberTextColor="black"
environmentTextColor="white"
#---------------------------
#***************************
# End App Specific Configuration
#***************************
#---------------------------



#---------------------------
# Get Arguments
#---------------------------
EXPECTED_ARGS=2
if [ $# -lt $EXPECTED_ARGS ]
then
  echo "Usage: ./icongen.sh [app name] [platform] [environment (optional)] [buildString (optional)]"
  echo "ex: ./icongen.sh app ios production \"1.2.4\""
  exit 1
fi

appName="app"
platform="web"
env=""
buildString=""

if [ "$1" ]
then
  appName=$1
fi

if [ "$2" ]
then
  platform=$2
fi

if [ "$3" ]
then
  env=$3
fi

if [ "$4" ]
then
  buildString=$4
fi

#format
if [ "$env" == "prod" -o "$env" == "production" ]
then
env="PROD"
fi
if [ "$env" == "stage" -o "$env" == "staging" ]
then
env="STAGE"
fi
if [ "$env" == "local" ]
then
env="LOCAL"
fi


#---------------------------
# Set Variables
#---------------------------
path="_icon_source.png"
banner='_banner_source.png'
tmp='tmp.png'
webPath="src/www/assets/img/"
iosPath="cordova/platforms/ios/${appName}/Resources/icons"
androidPath="cordova/platforms/android/res"

set -x
set -e

#---------------------------
# Create labeled icon
#---------------------------
if [ "$buildString" != "" ]
then

  composite ${banner} ${path} ${tmp}
    
  convert ${tmp} \
    -fill ${buildNumberTextColor} \
    -font Helvetica \
    -gravity north \
    -pointsize 100 \
    -annotate +0+50 ${buildString} \
    ${tmp}

  convert ${tmp} \
    -gravity center \
    -rotate 45 \
    ${tmp}

  convert ${tmp} \
    -fill ${environmentTextColor} \
    -font Helvetica-Bold \
    -pointsize 130 \
    -gravity south \
    -annotate -220+10 ${env} \
    ${tmp}

  convert ${tmp} \
    -gravity center \
    -rotate -45 \
    ${tmp}

  convert ${tmp} -crop 1024x1024+0+0 +repage ${tmp}

  path=${tmp}

fi



# This function takes in the dimension of the icon (it assumes the icon is a square) and the name of the file to save the icon to.
function createIconImage()
{
  iconDimension=$1
  iconName=$2

  convert ${path} \
    -resize ${iconDimension}x${iconDimension}^ \
    -gravity center \
    -extent ${iconDimension}x${iconDimension} \
    -unsharp 0x1 \
    ${iconName}
}


#---------------------------
# Do web specific things
#---------------------------
if [ "$platform" == "web" ]
then

  createIconImage 57  ${webPath}/apple-icon-57x57.png
  createIconImage 60  ${webPath}/apple-icon-60x60.png
  createIconImage 72  ${webPath}/apple-icon-72x72.png
  createIconImage 76  ${webPath}/apple-icon-76x76.png
  createIconImage 114 ${webPath}/apple-icon-114x114.png
  createIconImage 120 ${webPath}/apple-icon-120x120.png
  createIconImage 144 ${webPath}/apple-icon-144x144.png
  createIconImage 152 ${webPath}/apple-icon-152x152.png
  createIconImage 180 ${webPath}/apple-icon-180x180.png
  createIconImage 192 ${webPath}/android-icon-192x192.png
  createIconImage 32  ${webPath}/favicon-32x32.png
  createIconImage 96  ${webPath}/favicon-96x96.png
  createIconImage 16  ${webPath}/favicon-16x16.png
  createIconImage 36  ${webPath}/android-icon-36x36.png
  createIconImage 48  ${webPath}/android-icon-48x48.png
  createIconImage 72  ${webPath}/android-icon-72x72.png
  createIconImage 96  ${webPath}/android-icon-96x96.png
  createIconImage 144 ${webPath}/android-icon-144x144.png
  createIconImage 192 ${webPath}/android-icon-192x192.png
  createIconImage 558 ${webPath}/tile.png

  # Create Tile Wide
  convert "$path" -resize 558x270^ -gravity center -extent 558x270 src/www/assets/img/tile-wide.png

  # Create favicon.ico
  convert "$path"  -bordercolor white -border 0 \
        \( -clone 0 -resize 16x16 \) \
        \( -clone 0 -resize 32x32 \) \
        \( -clone 0 -resize 48x48 \) \
        \( -clone 0 -resize 64x64 \) \
        -delete 0 -alpha off -colors 256 src/www/favicon.ico
fi


#---------------------------
# Do iOS specific things
#---------------------------
if [ "$platform" == "ios" ]
then

  createIconImage 40   ${iosPath}/icon-40.png
  createIconImage 80   ${iosPath}/icon-40@2x.png
  createIconImage 50   ${iosPath}/icon-50.png
  createIconImage 100  ${iosPath}/icon-50@2x.png
  createIconImage 60   ${iosPath}/icon-60.png
  createIconImage 120  ${iosPath}/icon-60@2x.png
  createIconImage 180  ${iosPath}/icon-60@3x.png
  createIconImage 72   ${iosPath}/icon-72.png
  createIconImage 144  ${iosPath}/icon-72@2x.png
  createIconImage 76   ${iosPath}/icon-76.png
  createIconImage 152  ${iosPath}/icon-76@2x.png
  createIconImage 29   ${iosPath}/icon-small.png
  createIconImage 58   ${iosPath}/icon-small@2x.png
  createIconImage 57   ${iosPath}/icon.png
  createIconImage 114  ${iosPath}/icon@2x.png

fi


#---------------------------
# Do android specific things
#---------------------------
if [ "$platform" == "android" ]
then

  createIconImage 72  ${androidPath}/drawable-hdpi/icon.png
  createIconImage 36  ${androidPath}/drawable-ldpi/icon.png
  createIconImage 48  ${androidPath}/drawable-mdpi/icon.png
  createIconImage 96  ${androidPath}/drawable-xhdpi/icon.png

fi

rm ${tmp}

