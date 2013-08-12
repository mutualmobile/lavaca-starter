var path = require('path');
var fs = require('fs-extra');

var config = {
	lavacaModuleRoot: './node_modules/lavaca',
	dstpathRoot: './src/www/js'
};

config.symlinkSrcRoot = '../../../node_modules/lavaca/src/js';
config.requirejsMainConfig = path.join(config.lavacaModuleRoot, 'src/boot.js');
config.requireBootTarget = path.join(config.dstpathRoot, 'app/boot.js');
config.symlinkTargetLavaca = path.join(config.dstpathRoot, 'lavaca');
config.symlinkTargetLibs = path.join(config.dstpathRoot, 'libs');

fs.exists(config.lavacaModuleRoot, function(isLavacaInstalled) {
	if (!isLavacaInstalled) {
		return;
	}
	// make sure dir 'src/www/js/app' is in starter or existing project
	fs.mkdirsSync(path.join(config.dstpathRoot, 'app'));
	// copy boot.js
	fs.exists(config.requireBootTarget, function(exists) {
		if (exists) {
			fs.renameSync(config.requireBootTarget, config.requireBootTarget + '.old');
		}
		fs.createReadStream(config.requirejsMainConfig).pipe(fs.createWriteStream(config.requireBootTarget));
	});
	// create symlink for 'src/www/js/lavaca'
	fs.removeSync(config.symlinkTargetLavaca);
	fs.symlinkSync(path.join(config.symlinkSrcRoot, 'lavaca'), config.symlinkTargetLavaca);
	// create symlink for 'src/www/js/libs'
	fs.removeSync(config.symlinkTargetLibs);
	fs.symlinkSync(path.join(config.symlinkSrcRoot, 'libs'), config.symlinkTargetLibs);
});