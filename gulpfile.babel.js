// Common
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
const $ = gulpLoadPlugins();

// HTML
import fs from 'fs';
import path from 'path';

// CSS
import cssnext from 'postcss-cssnext';
import atImport from 'postcss-import';
import stylefmt from 'stylefmt';
import cssnano from 'cssnano';

// JavaScript(Babel)
import browserify from 'browserify';
import babelify from 'babelify';
import watchify from 'watchify';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';

// Utility
import runSequence from 'run-sequence';
import rimraf from 'rimraf';
import browserSync from 'browser-sync';

/**
 * 開発用用ディレクトリのパス。
 */
const develop = {
  'root': 'src/',
  'pug': ['src/**/*.pug', '!' + 'src/**/_*.pug'],
  'json': 'src/_data/',
  'css': ['src/assets/css/**/*.css', '!src/assets/css/**/_*.css'],
  'cssWatch': 'src/assets/css/**/*.css',
  'js': 'src/assets/js/main.js',
  'image': ['src/**/*.{png,jpg,gif,svg}', '!src/assets/icon/*.svg', '!src/assets/font/*.svg'],
  'iconfont': 'src/assets/icon/*.svg',
  'iconfontCss': 'src/assets/icon/template/_icon.css',
  'iconfontHtml': 'src/assets/icon/template/_icon.html'
};

/**
 * コンパイル先ディレクトリのパス。
 */
const release = {
  'root': 'docs/',
  'pug': 'docs/',
  'css': 'docs/assets/css/',
  'js': 'docs/assets/js/',
  'iconfont': 'docs/assets/font/',
  'iconfontCss': 'docs/assets/css/atoms/',
  'iconfontHtml': 'docs/assets/iconfont/',
  'iconfontFont': 'docs/assets/font/'
};

// 対応するブラウザの指定。
const AUTOPREFIXER_BROWSERS = [
  // @see https://github.com/ai/browserslist#browsers
  // Major Browsers（主要なブラウザの指定）
  'last 2 version', // （Major Browsersの）最新2バージョン
  'ie >= 11', // IE11以上
  'iOS >= 8', // iOS8以上
  // Other（Androidなどのマイナーなデバイスの指定）
  'Android >= 4.4' // Android4.4以上
];

/**
 * GitHub Pagesの独自ドメイン設定に必要なファイルです。
 */
gulp.task('cname', () => {
  gulp.src(develop.root + 'CNAME')
  .pipe(gulp.dest(release.root));
});

/**
 * PugをHTMLにコンパイルします。
 */
gulp.task('html', () => {
  // JSONファイルの読み込みます。
  const locals = {
    'site': JSON.parse(fs.readFileSync(develop.json + 'site.json')),
    'data': JSON.parse(fs.readFileSync(develop.json + 'data.json'))
  };
  return gulp.src(develop.pug)
  // エラーをポップアップで通知します。
  .pipe($.plumber({errorHandler: $.notify.onError("Error: <%= error.message %>")}))
  // 各ページごとの`/`を除いたルート相対パスを`relativePath`に格納します。
  .pipe($.data(function(file) {
    locals.relativePath = path.relative(file.base, file.path.replace(/.pug$/, '.html'));
      return locals;
  }))
  .pipe($.pug({
    // JSONとパス情報を渡します。
    locals: locals,
    // インクルードするときにルート相対パスが使えるようにします。
    // Pugファイルのルートパスを指定します。
    basedir: 'src',
    // `true`でHTMLを整形、`false`で圧縮されます。
    pretty: true
  }))
  .pipe(gulp.dest(release.pug))
  .pipe(browserSync.reload({stream: true}));
});

/**
 * CSSをPostCSSで処理します。
 */
gulp.task('css', () => {
  const plugins = [
    // `@import`規則でパーシャルファイルを連結します。
    atImport,
    cssnext({
      // ベンダープレフィックスの付与します。
      browsers: AUTOPREFIXER_BROWSERS
    }),
    // インデントなどの整形します。
    stylefmt,
    // Minify（圧縮）します。
    cssnano
  ];
  return gulp.src(develop.css)
  .pipe($.sourcemaps.init())
  .pipe($.postcss(plugins))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest(release.css))
  .pipe(browserSync.reload({stream: true}));
});

/**
 * Babelを使ってES2016を変換、watchifyでファイルの監視をします。
 */
function bundle(watching = false) {
  const b = browserify({
    entries: [develop.js],
    transform: ['babelify'],
    // sourcemapsはbrowserifyから出力しない。
    debug: false,
    plugin: (watching) ? [watchify] : null
  })
  .on('update', () => {
    bundler();
    console.log('scripts rebuild');
  });

  function bundler() {
    return b.bundle()
      .on('error', (err) => {
        console.log(err.message);
      })
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe($.sourcemaps.init())
      .pipe($.uglify())
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(release.js));
  }

  return bundler();
}

gulp.task('js', () => {
  bundle();
});

/**
 * 画像ファイルを圧縮します。
 */
gulp.task('img', () => {
  return gulp.src(develop.image)
  .pipe($.imagemin({
    // jpgをロスレス圧縮（画質を落とさず、メタデータを削除）。
    progressive: true,
    // gifをインターレースgifにします。
    interlaced: true,
    // PNGファイルの圧縮率（7が最高）を指定します。
    optimizationLevel: 7
  }))
  .pipe(gulp.dest(release.root))
  .pipe(browserSync.reload({stream: true}));
});

/**
 * SVGからアイコンフォントを生成します。
 * アイコンフォント用のCSSファイルとHTMLファイルも生成します。
 */
gulp.task('iconfont', () => {
  // シンボルフォント名を指定します。
  const fontName = 'iconfont';
  return gulp.src(develop.iconfont)
  .pipe($.iconfont({
    fontName: fontName,
    formats: ['ttf', 'eot', 'woff', 'svg'],
    // SVGファイル名にUnicodeを付与します（recommended option）。
    prependUnicode: false
  }))
  .on('glyphs', (codepoints, opt) => {
    const options = {
      glyphs: codepoints,
      fontName: fontName,
      // CSSファイルからfontファイルまでの相対パスを指定します。
      fontPath: '../font/',
      // CSSのクラス名を指定します。
      className: 'a-icon'
    };
    // CSSのテンプレートからCSSファイルを生成します。
    gulp.src(develop.iconfontCss)
    .pipe($.consolidate('lodash', options))
    .pipe($.rename({
      // 出力するCSSファイルをリネームします。
      basename: '_icon'
    }))
    .pipe(gulp.dest(release.iconfontCss));
    // アイコンフォントのサンプルHTMLを生成します。
    gulp.src(develop.iconfontHtml)
    .pipe($.consolidate('lodash', options))
    .pipe($.rename({
      basename: 'iconfont'
    }))
    // アイコンフォントのサンプルHTMLを生成するパスを指定します。
    .pipe(gulp.dest(release.iconfontHtml))
  })
  // fontファイルを出力するパスを指定します。
  .pipe(gulp.dest(release.iconfont));
});

/**
 * スタイルガイドを生成します。
 */
gulp.task('styleguide', () => {
  return gulp.src('./aigis/aigis_config.yml')
    .pipe($.aigis());
});

/**
 * releaseディレクトリを削除します。
 */
gulp.task('clean', function (cb) {
  rimraf(release.root, cb);
});

/**
 * ローカルサーバーを起動します。
 */
gulp.task('browser-sync', () => {
  browserSync({
    server: {
      baseDir: release.root,
      index: "index.html"
    }
  });
});

/**
 * 一連の開発用タスクを処理します。
 */
gulp.task('build', ['iconfont'], function() {
  runSequence(
    ['html', 'css', 'js', 'img', 'cname'],
    'styleguide'
    )
});

/**
 * 開発用タスクを監視します。
 */
gulp.task('watch', ['build'], () => {
  bundle(true);
  gulp.watch(develop.pug, ['html']);
  gulp.watch(develop.cssWatch, ['css']);
  gulp.watch(develop.cssWatch, ['styleguide']);
  gulp.watch(develop.image, ['img']);
  gulp.watch(develop.iconfont, ['iconfont']);
});

/**
 * 開発に使用するタスクです。`npm run build`で実行されます。
 * 開発用タスクを監視しながら、リアルタイムにブラウザに反映します。
 */
gulp.task('default', ['clean'], () => {
  runSequence(
    ['watch'],
    'browser-sync'
  )
});
