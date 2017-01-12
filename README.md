# CSS Talk website
CSSをテーマにした勉強会「CSS Talk」の公式サイトのリポジトリです。

## インストール
開発に必要なパッケージなどは以下のコマンドですべてインストールされます。クローンをしたあとに実行してください。

```
npm install
```

## 推奨環境
以下の環境で動作の確認をしています。

- OS X 10.11.5(El Capitan)
- Node.js 4.2.4

## ファイル構成
開発は`/src`ディレクトリでおこない、`/docs`ディレクトリに出力されます。

```
├── README.md
├── aigis/ // スタイルガイドのテンプレート
├── docs/ // 本番公開用のディレクトリ
├── gulpfile.babel.js // Gulpの設定ファイル
├── package.json // Node.jsの設定ファイル
└── src/ // 開発用のディレクトリ
    ├── _data/ // JSONファイル
    ├── _includes/ // Pugのテンプレートファイル
    ├── assets/ // サイト共通のファイル
    │   ├── css/ // CSSファイル
    │   ├── icon/ // アイコンフォント用のSVG
    │   │   └── template/ // アイコンフォント用のテンプレートファイル
    │   │       ├── _icon.css
    │   │       └── _icon.html
    │   ├── img/ // 画像ファイル
    │   └── js/ // JavaScriptファイル
    └── index.pug // Pugファイル
```

## 開発タスク
以下のコマンドを実行すると、開発に必要なGulpのタスクがすべて実行されます。

```
npm start
```

以下のような処理がおこなわれます。

- PugをHTMLにコンパイル
- PostCSSの処理を実行
- Babelの処理を実行
- 画像ファイルの圧縮
- アイコンフォントの自動生成
- スタイルガイドの自動生成
- ブラウザが起動して変更をリアルタイムに反映

スタイルガイドのインデックスページは`/src/assets/css/styleguide/index.md`に記述されています。監視対象にはなっていないので、すぐに更新したいときは以下のコマンドを実行してください。

```
npm run styleguide
```

## 公開URL
`/docs`ディレクトリは[https://csstalk.net/](https://csstalk.net/)として公開されます。
