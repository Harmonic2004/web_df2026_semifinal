"""
Chạy script này để kiểm tra checkpoint trước khi start API:

    python check_checkpoint.py

Sẽ in ra các thông số cần thiết và cảnh báo nếu thiếu n_classes_list.
"""

import torch, sys, os

PATH = os.path.join("model_weights", "trans_model_final.pt")
if not os.path.exists(PATH):
    print(f"❌ Không tìm thấy {PATH}")
    sys.exit(1)

ckpt = torch.load(PATH, map_location="cpu", weights_only=False)

print("=" * 55)
print("  CHECKPOINT INSPECTOR")
print("=" * 55)
print(f"  Keys trong checkpoint : {list(ckpt.keys())}")

cfg = ckpt.get("cfg", {})
print(f"\n  CFG:")
for k, v in cfg.items():
    print(f"    {k:20s}: {v}")

vocab = ckpt.get("vocab", None)
if vocab:
    print(f"\n  Vocab size            : {vocab.size}")
else:
    print("\n  ⚠️  Không tìm thấy vocab trong checkpoint!")

# Kiểm tra n_classes_list
if "n_classes_list" in ckpt:
    print(f"\n  n_classes_list        : {ckpt['n_classes_list']}  ✅")
else:
    print("\n  ⚠️  n_classes_list KHÔNG có trong checkpoint.")
    print("     Đang thử suy ra từ state_dict...")
    state = ckpt["model_state"]
    inferred = []
    for i in range(6):
        key = f"heads.{i}.fc.4.weight"
        if key in state:
            inferred.append(state[key].shape[0])
        else:
            print(f"     ❌ Không tìm thấy key: {key}")
            break
    if len(inferred) == 6:
        print(f"     ✅ Suy ra được: {inferred}")
        print(f"\n  💡 Để tránh lỗi sau này, thêm vào lúc torch.save():")
        print(f'     "n_classes_list": {inferred}')
    else:
        print("     ❌ Không suy ra được. Hãy thêm n_classes_list vào checkpoint.")

if "class_maps" in ckpt:
    print(f"\n  class_maps            : có ({len(ckpt['class_maps'])} heads)  ✅")
else:
    print(f"\n  class_maps            : không có (output sẽ là class index, không phải UINT16 thực)")

print("\n" + "=" * 55)
