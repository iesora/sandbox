<?php
/**
 * 求人詳細ページ - articleタグ内コンテンツ
 * 
 * 使用方法：
 * functions.php の the_content フィルター内で include または
 * テンプレートファイルとして直接読み込む
 */

$id = get_the_ID();

// =========================
// meta（カスタムフィールド）
// =========================
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

// 雇用形態が空ならデフォルト
if (!$employment_type) $employment_type = '正社員';

// taxonomy（任意：カテゴリ表示したい場合）
$terms = get_the_terms($id, 'job_category');
$cat_name = ($terms && !is_wp_error($terms)) ? $terms[0]->name : '';

// blog-like meta
$date = get_the_date('Y.m.d', $id);
$author = get_the_author_meta('display_name', get_post_field('post_author', $id));

// =========================
// 本文（テーマの本文を「仕事内容」として使う場合の互換）
//  - job_description があればそれを優先
//  - 無ければ the_content を仕事内容として表示
// =========================
$job_body_raw = $job_description ? $job_description : $content;
$job_body = wpautop($job_body_raw);

// 任意テキストも wpautop で整形（改行→<p>）
$requirements_html      = $requirements ? wpautop($requirements) : '';
$benefits_html          = $benefits ? wpautop($benefits) : '';
$company_info_html      = $company_info ? wpautop($company_info) : '';
$selection_process_html = $selection_process ? wpautop($selection_process) : '';
?>

<article id="lr-job">
  <nav class="breadcrumb">
    <a href="<?php echo esc_url(home_url('/')); ?>">TOP</a> ›
    <a href="<?php echo esc_url(get_post_type_archive_link('job1')); ?>">Job</a> ›
    <span><?php echo esc_html(get_the_title()); ?></span>
  </nav>

  <header class="job-header">
    <div class="job-badges">
      <?php if ($cat_name): ?>
        <span class="badge"><?php echo esc_html($cat_name); ?></span>
      <?php endif; ?>

      <?php if ($employment_type): ?>
        <span class="badge light"><?php echo esc_html($employment_type); ?></span>
      <?php endif; ?>

      <?php if ($work_location): ?>
        <span class="badge light"><?php echo esc_html($work_location); ?></span>
      <?php endif; ?>
    </div>

    <h1 class="job-title"><?php echo esc_html(get_the_title()); ?></h1>

    <div class="job-submeta">
      <span>公開日：<?php echo esc_html($date); ?></span>
      <?php if ($author): ?><span>投稿者：<?php echo esc_html($author); ?></span><?php endif; ?>
      <span>求人ID：<?php echo esc_html($id); ?></span>
    </div>
  </header>

  <!-- 本文（各セクション） -->
  <div class="entry-body">

    <h2>仕事内容</h2>
    <?php echo $job_body; ?>

    <?php if($employment_type): ?>
      <h2>雇用形態</h2>
      <p><?php echo esc_html($employment_type); ?></p>
    <?php endif; ?>

    <?php if($work_location): ?>
      <h2>勤務地</h2>
      <p><?php echo esc_html($work_location); ?></p>
    <?php endif; ?>

    <?php if($salary): ?>
      <h2>給与</h2>
      <p><?php echo esc_html($salary); ?></p>
    <?php endif; ?>

    <?php if($working_hours): ?>
      <h2>勤務時間</h2>
      <p><?php echo esc_html($working_hours); ?></p>
    <?php endif; ?>

    <?php if($holidays): ?>
      <h2>休日・休暇</h2>
      <p><?php echo esc_html($holidays); ?></p>
    <?php endif; ?>

    <?php if($requirements_html): ?>
      <h2>応募資格</h2>
      <?php echo $requirements_html; ?>
    <?php endif; ?>

    <?php if($benefits_html): ?>
      <h2>福利厚生</h2>
      <?php echo $benefits_html; ?>
    <?php endif; ?>

    <?php if($company_info_html): ?>
      <h2>会社情報</h2>
      <?php echo $company_info_html; ?>
    <?php endif; ?>

    <?php if($selection_process_html): ?>
      <h2>選考フロー</h2>
      <?php echo $selection_process_html; ?>
    <?php endif; ?>

  </div>

</article>

