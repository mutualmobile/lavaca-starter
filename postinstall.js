var path = require('path');
var fs = require('fs-extra');

var config = {
	lavacaModuleRoot: './node_modules/lavaca',
	dstpathRoot: './src/www/js'
};

config.symlinkSrcRoot = '../../../node_modules/lavaca/src/js';
config.hammerSrcRoot = '../../../../node_modules/hammerjs/dist';
config.requirejsMainConfig = path.join(config.lavacaModuleRoot, 'src/boot.js');
config.requireBootTarget = path.join(config.dstpathRoot, 'app/boot.js');
config.symlinkExtLibs = path.join(config.dstpathRoot, 'extlibs');
config.symlinkTargetLavaca = path.join(config.dstpathRoot, 'lavaca');
config.symlinkTargetLibs = path.join(config.dstpathRoot, 'libs');
config.symlinkTargetHammer = path.join(config.dstpathRoot, 'extlibs/jquery.hammer.js')

fs.exists(config.lavacaModuleRoot, function(isLavacaInstalled) {
	if (!isLavacaInstalled) {
		return;
	}
	// make sure dir 'src/www/js/app' is in starter or existing project
	fs.mkdirsSync(path.join(config.dstpathRoot, 'app'));
  // create symlink for lavaca
	fs.removeSync(config.symlinkTargetLavaca);
	fs.symlinkSync(path.join(config.symlinkSrcRoot, 'lavaca'), config.symlinkTargetLavaca);
	// create symlink for libs
	fs.removeSync(config.symlinkTargetLibs);
	fs.symlinkSync(path.join(config.symlinkSrcRoot, 'libs'), config.symlinkTargetLibs);
  // create symlink for hammer js
  fs.removeSync(config.symlinkTargetHammer);
  fs.mkdirSync(config.symlinkExtLibs);
  fs.symlinkSync(path.join(config.hammerSrcRoot, 'jquery.hammer.js'), config.symlinkTargetHammer);
});