# WordPress統合ファイル

このディレクトリには、求人詳細ページのWordPress統合用ファイルが含まれています。

## ファイル構成

1. **job-content-template.php** - articleタグ内のコンテンツ部分（テンプレートファイル）
2. **functions-integration.php** - テンプレートファイルを使用する統合コード
3. **functions-complete.php** - すべてを1つのファイルに統合した完全版（推奨）

## 使用方法

### 方法1: 完全統合版を使用（推奨）

`functions-complete.php` の内容をそのまま `functions.php` にコピー＆ペーストしてください。

**メリット:**
- 1つのファイルですべて完結
- テンプレートファイルの管理が不要
- シンプルで分かりやすい

### 方法2: テンプレートファイルを使用

1. `job-content-template.php` をテーマディレクトリ（または子テーマディレクトリ）にアップロード
2. `functions-integration.php` の内容を `functions.php` に追加

**メリット:**
- テンプレート部分を別ファイルで管理できる
- カスタマイズがしやすい

## カスタムフィールドの設定

以下のカスタムフィールド（metaキー）を設定してください：

- `employment_type` - 雇用形態（例: 正社員、契約社員）
- `location` - 勤務地（例: 東京都渋谷区）
- `salary` - 給与（例: 月給30万円〜50万円）
- `working_hours` - 勤務時間（例: 9:00〜18:00）
- `holidays` - 休日・休暇（例: 土日祝、年末年始）
- `job_description` - 仕事内容（本文がない場合に使用）
- `requirements` - 応募資格
- `benefits` - 福利厚生
- `company_info` - 会社情報
- `selection_process` - 選考フロー

## 見出しの順序

以下の順序で見出しが表示されます：

1. 仕事内容
2. 雇用形態
3. 勤務地
4. 給与
5. 勤務時間
6. 休日・休暇
7. 応募資格
8. 福利厚生
9. 会社情報
10. 選考フロー

## Contact Form 7の設定

応募フォームのショートコードIDを変更する場合は、`functions-complete.php` の以下の部分を編集してください：

```php
<?php echo do_shortcode('[contact-form-7 id="0301a6e" title="ジョブ問い合わせ"]'); ?>
```

`0301a6e` を実際のContact Form 7のIDに変更してください。

## 注意事項

- このコードは `job1` というカスタム投稿タイプを想定しています
- カスタムタクソノミー `job_category` を使用しています（任意）
- テーマの `functions.php` に追加する前に、必ずバックアップを取ってください

