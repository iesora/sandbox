<?php
/**
 * WordPress functions.php への統合コード
 * 
 * このコードを functions.php に追加するか、
 * または job-content-template.php を直接 include して使用してください
 */

/* =====================================================
 * CSS（job1 の詳細のみ）
 * ===================================================== */
add_action('wp_head', function () {
  if (!is_single() || get_post_type() !== 'job1') return;
?>
<style>
/* ===== テーマ側H1を非表示 ===== */
.single-job1 h1{ display:none !important; }

/* ===== ベース ===== */
#lr-job{
  max-width: 920px;
  margin: 0px auto 0;
  padding: 0 20px;
  font-family: "Helvetica Neue","Hiragino Kaku Gothic ProN",Meiryo,sans-serif;
  color:#2C2C2C;
  line-height:1.9;
}

/* ===== パンくず ===== */
#lr-job .breadcrumb{
  font-size:13px;
  color:#777;
  margin: 0 0 18px;
}
#lr-job .breadcrumb a{ color:#777; text-decoration:none; }
#lr-job .breadcrumb a:hover{ text-decoration:underline; }

/* ===== ヘッダー（ブログ風） ===== */
.job-header{
  padding: 28px 0 14px;
  border-bottom: 1px solid #eee;
  margin-bottom: 26px;
}
.job-badges{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin-bottom:12px;
}
.badge{
  display:inline-flex;
  align-items:center;
  padding:6px 12px;
  border-radius:999px;
  font-size:12px;
  background:#2C2C2C;
  color:#fff;
}
.badge.light{
  background:#f3f3f3;
  color:#333;
}
.job-title{
  display:block !important;
  font-size:34px;
  font-weight:800;
  line-height:1.35;
  margin: 10px 0 10px;
}
.job-submeta{
  font-size:13px;
  color:#777;
  display:flex;
  flex-wrap:wrap;
  gap:14px;
}

/* ===== 記事本文（ブログっぽく） ===== */
.entry-body{
  font-size:16px;
}
.entry-body > *:first-child{ margin-top:0; }
.entry-body p{ margin: 0 0 16px; }
.entry-body h2{
  font-size:22px;
  margin:48px 0 14px;
  padding-left: 12px;
  border-left: 4px solid #2C2C2C;
}
.entry-body h3{
  font-size:18px;
  margin:30px 0 10px;
}
.entry-body ul, .entry-body ol{
  padding-left: 1.2em;
  margin: 0 0 18px;
}
.entry-body blockquote{
  margin: 22px 0;
  padding: 16px 18px;
  background: #fafafa;
  border-left: 4px solid #ddd;
  border-radius: 12px;
}
.entry-body hr{
  border:0;
  border-top:1px solid #eee;
  margin: 34px 0;
}

/* =====================================================
 * 応募セクション
 * ===================================================== */
.job-apply-section{
  max-width: 920px;
  margin: 90px auto 110px;
  padding: 0 20px;
}
.job-apply-intro{
  text-align:center;
  margin-bottom:32px;
}
.job-apply-intro h2{
  font-size:28px;
  font-weight:800;
  margin-bottom:10px;
}
.job-apply-intro p{
  font-size:15px;
  color:#666;
}
.job-apply-card{
  background:#fff;
  border-radius:20px;
  padding:46px 40px;
  box-shadow:0 12px 30px rgba(0,0,0,.06);
  border:1px solid #eee;
}

/* ===== フォーム ===== */
.form-label{
  font-weight:700;
  margin-bottom:-24px;
  display:block;
}
.required{
  background:#2C2C2C;
  color:#fff;
  font-size:10px;
  padding:3px 8px;
  border-radius:4px;
  margin-left:6px;
}
.form-input,
.form-select,
.form-textarea{
  width:100%;
  padding:14px 16px;
  border:2px solid #eee;
  border-radius:10px;
  font-size:15px;
}
.form-textarea{ resize:vertical; }

/* ===== プライバシー同意（checkbox想定） ===== */
.form-checkbox-label{
  display:flex;
  align-items:center;
  gap:10px;
  margin: 8px 0 10px;
}
.form-checkbox-label input[type="checkbox"]{
  width:18px;
  height:18px;
}
.form-checkbox-label a{
  color:#1a73e8;
  text-decoration:underline;
  font-weight:500;
}
/* CF7の既存必須バッジが邪魔なら隠す（運用により不要なら消してOK） */
.form-checkbox-label .required{
  position:absolute;
  opacity:0;
}
.form-checkbox-label .wpcf7-not-valid-tip{
  display:block;
  margin-top:6px;
  margin-left:28px;
  color:#d63638;
  font-size:13px;
}

/* ===== 応募ボタン中央 ===== */
.job-apply-card .wpcf7-form p:last-of-type{
  display:flex;
  justify-content:center;
}
.job-apply-card .btn{
  width:100%;
  max-width:320px;
  padding:18px 0;
  font-size:16px;
  font-weight:800;
  background:#fff;
  color:#2C2C2C;
  border:2px solid #2C2C2C;
  border-radius:999px;
  transition:.25s;
}
.job-apply-card .btn:hover{
  background:#2C2C2C;
  color:#fff;
}

/* ===== 求人一覧に戻る ===== */
.job-back-nav{
  display:flex;
  justify-content:center;
  margin-top:54px;
}
.job-back-nav .btn-back{
  width:100%;
  max-width:320px;
  padding:18px 0;
  font-size:16px;
  font-weight:800;
  background:#fff;
  color:#2C2C2C;
  border:2px solid #2C2C2C;
  border-radius:999px;
  text-decoration:none;
  text-align:center;
  transition:.25s;
}
.job-back-nav .btn-back:hover{
  background:#2C2C2C;
  color:#fff;
}

/* SP */
@media(max-width:768px){
  .job-title{ font-size:26px; }
  .job-apply-card{ padding:32px 20px; }
}
</style>
<?php
});

/* =====================================================
 * コンテンツ制御（job1 のみ差し替え）
 * ===================================================== */
add_filter('the_content', function ($content) {

  if (!is_single() || !is_main_query() || get_post_type() !== 'job1') {
    return $content;
  }

  // テンプレートファイルを読み込む
  // $content変数をテンプレートで使用できるようにする
  ob_start();
  // テンプレートファイルのパスを指定（テーマディレクトリまたは子テーマディレクトリ）
  $template_path = locate_template('job-content-template.php');
  if ($template_path) {
    include $template_path;
  } else {
    // テンプレートファイルが見つからない場合は、直接コードを実行
    $id = get_the_ID();
    $employment_type   = get_post_meta($id, 'employment_type', true);
    $work_location     = get_post_meta($id, 'location', true);
    $salary            = get_post_meta($id, 'salary', true);
    $working_hours     = get_post_meta($id, 'working_hours', true);
    $holidays          = get_post_meta($id, 'holidays', true);
    $job_description   = get_post_meta($id, 'job_description', true);
    $requirements      = get_post_meta($id, 'requirements', true);
    $benefits          = get_post_meta($id, 'benefits', true);
    $company_info      = get_post_meta($id, 'company_info', true);
    $selection_process = get_post_meta($id, 'selection_process', true);
    if (!$employment_type) $employment_type = '正社員';
    $terms = get_the_terms($id, 'job_category');
    $cat_name = ($terms && !is_wp_error($terms)) ? $terms[0]->name : '';
    $date = get_the_date('Y.m.d', $id);
    $author = get_the_author_meta('display_name', get_post_field('post_author', $id));
    $job_body_raw = $job_description ? $job_description : $content;
    $job_body = wpautop($job_body_raw);
    $requirements_html      = $requirements ? wpautop($requirements) : '';
    $benefits_html          = $benefits ? wpautop($benefits) : '';
    $company_info_html      = $company_info ? wpautop($company_info) : '';
    $selection_process_html = $selection_process ? wpautop($selection_process) : '';
    include get_template_directory() . '/job-content-template.php';
  }
  $output = ob_get_clean();

  // 応募セクションを追加
  ob_start();
?>
<section class="job-apply-section">
  <div class="job-apply-intro">
    <h2>この求人に応募する</h2>
    <p>以下のフォームに必要事項をご記入の上、送信してください。<br>担当者より3営業日以内にご連絡いたします。</p>
  </div>

  <div class="job-apply-card">
    <?php echo do_shortcode('[contact-form-7 id="0301a6e" title="ジョブ問い合わせ"]'); ?>
  </div>

  <div class="job-back-nav">
    <a class="btn-back" href="<?php echo esc_url(get_post_type_archive_link('job1')); ?>">求人一覧に戻る</a>
  </div>
</section>
<?php
  $apply_section = ob_get_clean();

  return $output . $apply_section;

}, 999);

