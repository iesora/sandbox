// Job detail data
const jobData = {
    '1': {
        type: '正社員',
        status: '募集中',
        title: '採用コンサルタント',
        summary: 'クライアント企業での採用戦略立案から実行支援まで、トータルでサポートする採用コンサルタントの求人です。',
        location: '東京都渋谷区（リモート可）',
        salary: '年収500万円〜800万円',
        time: 'フレックスタイム制',
        content: `
            <p>採用コンサルタントとして、企業の採用課題を解決するための戦略立案から実行支援まで、幅広い業務を担当していただきます。</p>
            <h3>具体的な業務内容</h3>
            <ul>
                <li>クライアント企業の採用戦略立案・設計</li>
                <li>採用要件定義、ペルソナ設計</li>
                <li>採用チャネルの選定・運用支援</li>
                <li>採用プロセスの設計・改善</li>
                <li>面接官トレーニング</li>
                <li>採用広報・ブランディング支援</li>
                <li>データ分析による採用活動の改善提案</li>
            </ul>
        `,
        requirements: `
            <h3>必須要件</h3>
            <ul>
                <li>事業会社またはコンサルティング会社での採用経験（3年以上）</li>
                <li>採用戦略の立案・実行経験</li>
                <li>論理的思考力と問題解決能力</li>
                <li>クライアントとの良好なコミュニケーション能力</li>
            </ul>
            <h3>歓迎要件</h3>
            <ul>
                <li>人事コンサルティング経験</li>
                <li>スタートアップでの採用経験</li>
                <li>採用マーケティング、採用広報の経験</li>
                <li>データ分析スキル（Excel、Googleスプレッドシート等）</li>
            </ul>
        `
    },
    '2': {
        type: '正社員',
        status: '募集中',
        title: 'HRコンサルタント',
        summary: '人事制度設計、組織開発、人材育成など、企業の人事課題を解決するHRコンサルタントの求人です。',
        location: '東京都渋谷区（リモート可）',
        salary: '年収600万円〜1000万円',
        time: 'フレックスタイム制',
        content: `
            <p>HRコンサルタントとして、企業の人事制度設計、組織開発、人材育成など、幅広い人事課題の解決をサポートしていただきます。</p>
            <h3>具体的な業務内容</h3>
            <ul>
                <li>人事制度の設計・改善支援</li>
                <li>評価制度・報酬制度の構築</li>
                <li>組織診断・組織開発支援</li>
                <li>人材育成プログラムの企画・実施</li>
                <li>エンゲージメント向上施策の立案・実行</li>
                <li>タレントマネジメント戦略の策定</li>
                <li>人事データ分析と改善提案</li>
            </ul>
        `,
        requirements: `
            <h3>必須要件</h3>
            <ul>
                <li>事業会社での人事経験（5年以上）またはHRコンサルティング経験（3年以上）</li>
                <li>人事制度設計または組織開発の実務経験</li>
                <li>論理的思考力と課題解決能力</li>
                <li>優れたコミュニケーション能力とファシリテーション能力</li>
            </ul>
            <h3>歓迎要件</h3>
            <ul>
                <li>コンサルティングファームでの経験</li>
                <li>組織開発・人材開発の専門知識</li>
                <li>プロジェクトマネジメント経験</li>
                <li>人事データ分析スキル</li>
            </ul>
        `
    },
    '3': {
        type: '業務委託',
        status: '募集中',
        title: '採用広報・マーケティング',
        summary: '採用ブランディング、SNS運用、採用サイト制作など、採用広報全般を担当するマーケターの求人です。',
        location: 'フルリモート',
        salary: '月額50万円〜80万円',
        time: '週3日〜（応相談）',
        content: `
            <p>採用広報・マーケティング担当として、企業の採用ブランディングからSNS運用、採用サイト制作まで、幅広い採用マーケティング業務を担当していただきます。</p>
            <h3>具体的な業務内容</h3>
            <ul>
                <li>採用ブランディング戦略の立案・実行</li>
                <li>採用サイト・採用ページの企画・制作</li>
                <li>SNS（Twitter、note等）の運用</li>
                <li>採用イベント・ウェビナーの企画・運営</li>
                <li>採用広報コンテンツの企画・制作</li>
                <li>候補者体験（Candidate Experience）の向上施策</li>
                <li>採用マーケティングの効果測定・改善</li>
            </ul>
        `,
        requirements: `
            <h3>必須要件</h3>
            <ul>
                <li>Webマーケティングまたは採用マーケティングの実務経験（3年以上）</li>
                <li>コンテンツ企画・制作の経験</li>
                <li>SNS運用の実務経験</li>
                <li>基本的なWebデザインスキル（Figma、Canva等）</li>
            </ul>
            <h3>歓迎要件</h3>
            <ul>
                <li>採用ブランディングの実務経験</li>
                <li>スタートアップでの採用広報経験</li>
                <li>動画制作・編集スキル</li>
                <li>Google Analytics等の分析ツールの使用経験</li>
            </ul>
        `
    },
    '4': {
        type: '正社員',
        status: '募集中',
        title: 'リクルーター（RPO）',
        summary: 'クライアント企業の採用業務を代行し、母集団形成から選考調整まで幅広く対応するリクルーターの求人です。',
        location: '東京都渋谷区（リモート可）',
        salary: '年収400万円〜600万円',
        time: '9:00〜18:00（フレックス可）',
        content: `
            <p>リクルーター（RPO）として、企業の採用業務を代行し、母集団形成から内定承諾まで、採用プロセス全体をサポートしていただきます。</p>
            <h3>具体的な業務内容</h3>
            <ul>
                <li>求人票の作成・求人媒体への掲載</li>
                <li>母集団形成（スカウト送信、エージェント対応等）</li>
                <li>応募者対応・日程調整</li>
                <li>書類選考のサポート</li>
                <li>面接の実施（一次面接）</li>
                <li>候補者フォロー・クロージング</li>
                <li>採用データの管理・レポーティング</li>
            </ul>
        `,
        requirements: `
            <h3>必須要件</h3>
            <ul>
                <li>事業会社での採用実務経験（2年以上）または人材紹介会社でのRA/CA経験</li>
                <li>候補者対応の経験</li>
                <li>基本的なPCスキル（Excel、メール等）</li>
                <li>丁寧なコミュニケーション能力</li>
            </ul>
            <h3>歓迎要件</h3>
            <ul>
                <li>RPO（採用代行）の実務経験</li>
                <li>複数企業の採用業務を同時並行で進めた経験</li>
                <li>ダイレクトリクルーティングの経験</li>
                <li>ATSの使用経験</li>
            </ul>
        `
    }
};

// Get job ID from URL parameter
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id') || '1';
    
    // Load job data
    const job = jobData[jobId];
    
    if (job) {
        // Update page title
        document.title = `${job.title} - LR consulting`;
        
        // Update breadcrumb
        document.getElementById('breadcrumb-title').textContent = job.title;
        
        // Update job header
        document.getElementById('job-type').textContent = job.type;
        document.getElementById('job-status').textContent = job.status;
        document.getElementById('job-title').textContent = job.title;
        document.getElementById('job-summary').textContent = job.summary;
        
        // Update quick info
        document.getElementById('job-location').textContent = job.location;
        document.getElementById('job-salary').textContent = job.salary;
        document.getElementById('job-time').textContent = job.time;
        
        // Update content sections
        document.getElementById('job-content').innerHTML = job.content;
        document.getElementById('job-requirements').innerHTML = job.requirements;
    }

    // Handle form submission
    const form = document.getElementById('applicationForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            // Add job information
            data.jobId = jobId;
            data.jobTitle = job ? job.title : '';
            
            // Here you would typically send the data to a server
            console.log('Application submitted:', data);
            
            // Show success message
            alert('応募を受け付けました。\n担当者より3営業日以内にご連絡いたします。\nありがとうございました。');
            
            // Optionally redirect to thank you page or reset form
            form.reset();
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
