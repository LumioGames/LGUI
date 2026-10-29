# FairyGUI-unity source

Source: [fairygui/FairyGUI-unity](https://github.com/fairygui/FairyGUI-unity/tree/8cc8f214cca79685532eef13372d0a4f74acdf08), commit `8cc8f214cca79685532eef13372d0a4f74acdf08`.

Only the original `Assets/Scripts` tree and root `LICENSE` are included. The source tree, `.meta` files, and original assembly definition are preserved. Git tree of `Assets/Scripts`: `a2406d04158c0e475ad6079f0a67b7b15912690c`.

The original MIT notice is in [LICENSE](LICENSE). `Tween/EaseManager.cs` retains its DOTween terms link and Robert Penner BSD notice. `Core/Text/RTLSupport.cs` retains Copyright (c) 2018 Tadpole Studio and its “All rights reserved” notice; this is third-party source and is not relicensed as LGUI-original MIT code. Removing that file was tested in Unity 6000.6.6f1 and fails with `CS0246` at `TextField.cs:22`, so the original file is retained. The first LGUI version does not claim right-to-left UI support.
