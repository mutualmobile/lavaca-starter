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
splashSizePercentageAsDecimal=0.7
#---------------------------
#***************************
# End App Specific Configuration
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
shouldGenerateIcons=false


#---------------------------
# Get Arguments
#---------------------------
EXPECTED_ARGS=1
if [ $# -lt $EXPECTED_ARGS ]
then
  echo "Usage: ./icongen.sh [platform] [environment (optional)] [buildString (optional)]"
  echo "ex: ./icongen.sh app ios production \"1.2.4\""
  exit 1
fi

appName="${appName}"
platform="web"
env=""
buildString=""


if [ "$1" ]
then
  platform=$1
fi

if [ "$2" ]
then
  env=$2
fi

if [ "$3" ]
then
  buildString=$3
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
path="src/_icon_source.png"
pathAndroid="src/_icon_source_android.png"
splashPath="src/_splash_source.png"
banner="src/_banner_source.png"
tmp="tmp.png"
rootWebPath="src/www"
webPath="${rootWebPath}/assets/img"
iosPath="cordova/platforms/ios/${appName}/Resources/icons"
iosSplashPath="cordova/platforms/ios/${appName}/Resources/splash"
androidPath="cordova/platforms/android/res"
iconFillColor=$(convert $path -format "%[pixel: u.p{0,0}]" info:)
splashFillColor=$(convert $splashPath -format "%[pixel: u.p{0,0}]" info:)

set -x
set -e



#---------------------------
# Build Platform Specific
#---------------------------
font1="Helvetica"
font2="Helvetica-Bold"
buildOS="unknown"
unamestr=`uname`

if [[ "$unamestr" == "Linux" ]] 
then

  buildOS="linux"
  font1="DejaVu-Sans"
  font2="DejaVu-Sans-Bold"

elif [[ "$unamestr" == "Darwin" ]] 
then

  buildOS="osx"

fi


if [ "$platform" == "android" ]
then

  path=$pathAndroid
  
fi


#---------------------------
# Create labeled icon
#---------------------------
if [ "$buildString" != "" ]
then

  composite ${banner} ${path} ${tmp}
    
  convert ${tmp} \
    -fill ${buildNumberTextColor} \
    -font ${font1} \
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
    -font ${font2} \
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



# This function takes in the dimension of the icon 
# (it assumes the icon is a square) and the name of the file to save the icon to.
function createIconImage()
{
  iconDimension=$1
  fileName=$2

  convert ${path} \
    -resize ${iconDimension}x${iconDimension}^ \
    -gravity center \
    -extent ${iconDimension}x${iconDimension} \
    -unsharp 0x1 \
    ${fileName}
}


# This function takes in the dimension of the splash screen 
# and scales the source image to fit well in the layout
function createSplashImage()
{
  width=$1
  height=$2
  fileName=$3
  innerDimension=$(echo "$splashSizePercentageAsDecimal*$width" | bc)

  if [ "$width" -gt "$height" ]
  then
    innerDimension=$(echo "$splashSizePercentageAsDecimal*$height" | bc)
  fi

  convert ${splashPath} \
    -background ${splashFillColor} \
    -resize ${innerDimension}x${innerDimension}^ \
    -gravity center \
    -extent ${width}x${height} \
    -unsharp 0x1 \
    ${fileName}
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
  convert "$path" \
    -background ${iconFillColor} \
    -resize 270x270^ \
    -gravity center \
    -extent 558x270 \
    ${webPath}/tile-wide.png

  # Create favicon.ico
  convert "$path"  -bordercolor white -border 0 \
        \( -clone 0 -resize 16x16 \) \
        \( -clone 0 -resize 32x32 \) \
        \( -clone 0 -resize 48x48 \) \
        \( -clone 0 -resize 64x64 \) \
        -delete 0 -alpha off -colors 256 ${rootWebPath}/favicon.ico

  createSplashImage 320 460 ${webPath}/splash-320x460.png
  createSplashImage 320 480 ${webPath}/splash-320x480.png
  createSplashImage 640 920 ${webPath}/splash-640x920.png
  createSplashImage 640 960 ${webPath}/splash-640x960.png
  createSplashImage 640 1096 ${webPath}/splash-640x1096.png
  createSplashImage 640 1136 ${webPath}/splash-640x1136.png
  createSplashImage 768 1004 ${webPath}/splash-768x1004.png
  createSplashImage 1024 748 ${webPath}/splash-1024x748.png
  createSplashImage 1536 2008 ${webPath}/splash-1536x2008.png
  createSplashImage 2048 1496 ${webPath}/splash-2048x1496.png

fi


#---------------------------
# Do iOS specific things
#---------------------------
if [ "$platform" == "ios" ]
then

  createIconImage 40   ${iosPath}/icon-40.png
  createIconImage 80   ${iosPath}/icon-40@2x.png
  createIconImage 120   ${iosPath}/icon-40@3x.png
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
  createIconImage 87   ${iosPath}/icon-small@3x.png
  createIconImage 29   ${iosPath}/icon-29.png
  createIconImage 58   ${iosPath}/icon-29@2x.png
  createIconImage 87   ${iosPath}/icon-29@3x.png
  createIconImage 57   ${iosPath}/icon.png
  createIconImage 114  ${iosPath}/icon@2x.png

  createSplashImage 640 1136 ${iosSplashPath}/Default-568h@2x~iphone.png
  createSplashImage 750 1334 ${iosSplashPath}/Default-667h.png
  createSplashImage 1242 2208 ${iosSplashPath}/Default-736h.png
  createSplashImage 2208 1242 ${iosSplashPath}/Default-Landscape-736h.png
  createSplashImage 2048 1536 ${iosSplashPath}/Default-Landscape@2x~ipad.png
  createSplashImage 1024 768 ${iosSplashPath}/Default-Landscape~ipad.png
  createSplashImage 1536 2048 ${iosSplashPath}/Default-Portrait@2x~ipad.png
  createSplashImage 768 1024 ${iosSplashPath}/Default-Portrait~ipad.png
  createSplashImage 640 960 ${iosSplashPath}/Default@2x~iphone.png
  createSplashImage 320 480 ${iosSplashPath}/Default~iphone.png

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

  createSplashImage 800 480 ${androidPath}/drawable-land-hdpi/screen.png
  createSplashImage 320 200 ${androidPath}/drawable-land-ldpi/screen.png
  createSplashImage 480 320 ${androidPath}/drawable-land-mdpi/screen.png
  createSplashImage 1280 720 ${androidPath}/drawable-land-xhdpi/screen.png
  createSplashImage 480 800 ${androidPath}/drawable-port-hdpi/screen.png
  createSplashImage 200 320 ${androidPath}/drawable-port-ldpi/screen.png
  createSplashImage 320 480 ${androidPath}/drawable-port-mdpi/screen.png
  createSplashImage 720 1280 ${androidPath}/drawable-port-xhdpi/screen.png

fi


#---------------------------
# Remove temp file
#---------------------------
if [ -e "${tmp}" ]
then
  rm ${tmp}
fi
