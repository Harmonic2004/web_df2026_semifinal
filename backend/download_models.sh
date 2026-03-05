echo "Downloading model 1..."
wget -O model_weights/embeddings.pt \
https://huggingface.co/DangDinh/semi_fianl_df2026/resolve/main/embeddings.pt

echo "Downloading model 2..."
wget -O model_weights/trans_model_final.pt \
https://huggingface.co/DangDinh/semi_fianl_df2026/resolve/main/trans_model_final.pt

echo "Models downloaded."