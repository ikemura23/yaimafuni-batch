#!/bin/bash

# ========================================
# serviceAccountKey.json をクリップボードにコピー
# ========================================

# 色付きの出力関数
print_success() {
    echo -e "\033[32m✅ $1\033[0m"
}

print_error() {
    echo -e "\033[31m❌ $1\033[0m"
}

print_info() {
    echo -e "\033[34mℹ️  $1\033[0m"
}

# ファイルの存在確認
if [ ! -f "serviceAccountKey.json" ]; then
    print_error "serviceAccountKey.json が見つかりません"
    exit 1
fi

print_info "serviceAccountKey.json をクリップボードにコピー中..."

# jqがインストールされているか確認
if command -v jq &> /dev/null; then
    # jqを使用してJSONを圧縮してクリップボードにコピー
    cat serviceAccountKey.json | jq -c . | pbcopy
    
    if [ $? -eq 0 ]; then
        print_success "jqを使用してクリップボードにコピーしました"
    else
        print_error "クリップボードへのコピーに失敗しました"
        exit 1
    fi
else
    # jqがない場合はtrを使用
    cat serviceAccountKey.json | tr -d '\n' | tr -d ' ' | pbcopy
    
    if [ $? -eq 0 ]; then
        print_success "trを使用してクリップボードにコピーしました"
    else
        print_error "クリップボードへのコピーに失敗しました"
        exit 1
    fi
fi

print_info "使用方法:"
echo "  環境変数として設定:"
echo "  export YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT='[クリップボードの内容をペースト]'"
echo ""
print_success "完了！" 