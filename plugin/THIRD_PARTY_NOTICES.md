# 第三方组件与素材通知

LGUI 的 MIT 许可（[LICENSE](LICENSE)）只覆盖 LumioGames 的原创代码、脚本和文档，不重新许可第三方源码、编辑器界面资源、品牌、原生库、字体或图片。本文按插件里实际打包的东西逐项列出；许可原文附在文末。

## 现在打包在插件里的

| 组件 | 位置 | 固定版本 | 许可与署名 |
| --- | --- | --- | --- |
| [FairyGUI-dom](https://github.com/fairygui/FairyGUI-dom/tree/fade49fc33bdcd5673351e04637d4cc08d2297f3) 运行时 | `framework/backends/h5/vendor/` | 提交 `fade49fc33bdcd5673351e04637d4cc08d2297f3` | MIT，Copyright (c) 2021 FairyGUI；许可原文同目录 `FairyGUI-LICENSE.txt`，并见文末 |
| PuerTS 兼容补丁 | `framework/backends/unity/patches/puerts-3.0.3-unity-6.6-unbox.patch` | 针对 [PuerTS Unity_v3.0.3](https://github.com/Tencent/puerts/releases/tag/Unity_v3.0.3)（源码提交 `d8871238a3774fd10600995a5325e4b2ab4e39fb`） | 补丁内含 PuerTS 源码片段：BSD-3-Clause，Copyright (C) 2020 Tencent，许可原文见文末。补丁只把固定 C++ 模板里四处 `Object::Unbox` 改为公开的 `il2cpp_object_unbox`，用于 Unity 6000.6，不改变原许可 |
| 技能 `skills/` | `skills/` | — | LumioGames 原创，MIT。其中 `lgui-author` 的 references 并入了团队提供的 fairygui-ui 设计技能：2026-10-16 维护者确认「团队原创，可随 LGUI 按 MIT 发布」，原包 SHA256 `e0ac8457ea7214d34a74f3297b570d5cff7096a87e06cb383a94b4504d25a858` |

FairyGUI-dom 的 `src/tween/EaseManager.ts` 含 Daniele Giardini/DOTween 条款链接及 Robert Penner 的 BSD 声明，随运行时一起保留。

## 后续任务打包时要附带的说明

下面两项现在还没有打包进插件，对应任务打包时照这里的说明处理。

**FairyGUI-unity（S3-01 打包）。** [FairyGUI-unity](https://github.com/fairygui/FairyGUI-unity/tree/8cc8f214cca79685532eef13372d0a4f74acdf08) 提交 `8cc8f214cca79685532eef13372d0a4f74acdf08`，MIT，Copyright (c) 2015 fairygui.com；只复制 `Assets/Scripts`，同时复制原 LICENSE。`Assets/Scripts/Tween/EaseManager.cs` 含 DOTween 条款链接及 Robert Penner 的 BSD 声明。`Assets/Scripts/Core/Text/RTLSupport.cs` 另有 Copyright (c) 2018 Tadpole Studio、All rights reserved 的声明，目前只确认该声明存在，没有单独取得授权链证明；不能把它称为 LGUI 原创 MIT 代码。

**编辑器（S2-I1 打包）。** [FairyGUI Editor Online](https://github.com/OpenFairyGUI/FairyGUI-Editor-Online/tree/45f0bef93bb16d507552b673ace6d5af417a8a0f) 提交 `45f0bef93bb16d507552b673ace6d5af417a8a0f`：原创代码和文档 MIT，Copyright (c) 2026 FairyGUI Editor Online contributors；打包时保留它的 LICENSE、THIRD_PARTY_NOTICES、TRADEMARKS（原文见文末）。它内嵌 LayaAir 3.3.10（MIT，Copyright (c) 2022 layabox）、FairyGUI-Layabox（MIT，Copyright (c) 2015 fairygui.com，含 easing 与 zlib.js/imaya 通知）、OpenFairyGUI 0.2.4（MIT）、fflate 0.8.3 等。编辑器的官方 UI 工程、图标与生成包沿用上游资源：上游 README 声称 UI 工程可自由使用，但没有独立的标准许可文件，上游提到的口头授权不会自动延伸到 fork。改名 LGUI 不授予 FairyGUI 的名称、Logo、品牌或官方背书。再发行编辑器构建前，要保留上述通知并单独核实这些资源的许可。

## 许可原文

### FairyGUI-dom

```
MIT License

Copyright (c) 2021 FairyGUI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### FairyGUI-unity

```
The MIT License (MIT)

Copyright (c) 2015 fairygui.com

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

### OpenFairyGUI

```
MIT License

Copyright (c) 2026 OpenFairyGUI Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### PuerTS 3.0.3（Core 与 V8 两个包的 LICENSE 内容相同）

```
Tencent is pleased to support the open source community by making Puerts available. 

Copyright (C) 2020 Tencent.  All rights reserved.

Puerts is licensed under the BSD 3-Clause license, except for the third-party components listed below. 

The copyright notice pertaining to the Tencent code in this repo was previously in the name of “THL A29 Limited.”  That entity has now been de-registered.  You should treat all previously distributed copies of the code as if the copyright notice was in the name of “Tencent.”

Terms of the BSD 3-Clause license:
--------------------------------------------------------------------
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.



Other dependencies and licenses:
Open Source Software Licensed under the MIT license: 
--------------------------------------------------------------------
1. doT
Copyright (c) 2011 Laura Doktorova
Copyright (c) 2010 aefxx,http://aefxx.com/ 


Terms of the MIT license: 
--------------------------------------------------------------------
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

### FairyGUI Editor Online：LICENSE

```
MIT License

Copyright (c) 2026 FairyGUI Editor Online contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### FairyGUI Editor Online：TRADEMARKS

```
# 商标与品牌使用政策

## 软件许可证与商标

本项目原创代码依据 [MIT License](./LICENSE) 提供。该软件许可证不授予 FairyGUI 名称、Logo 或其他品牌标识的使用权，也不表示 FairyGUI 官方对本项目或其衍生项目提供赞助、认证或背书。

第三方代码和资源继续适用各自的许可证，详见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。

## FairyGUI 品牌

“FairyGUI”名称、官方 Logo 及相关品牌标识的权利归其权利人所有。本项目并非 FairyGUI 官方产品。

本项目使用的编辑器 UI 工程已取得 FairyGUI 官方口头授权。该授权仅适用于本项目当前的编辑器 UI 使用范围，不构成通用商标许可，不自动转让或扩展至 fork、衍生项目、再发行方或其他第三方。

## 衍生项目与再发行

第三方将 FairyGUI 名称或品牌标识用于项目命名、Logo、发行或推广前，应另行取得 FairyGUI 官方授权。未取得授权时，应更换可能使用户误认为官方产品或官方合作项目的名称、Logo 和视觉标识。

仅为说明格式兼容性、技术依赖或事实来源而引用 FairyGUI 名称时，应清楚标明第三方身份，并遵守适用法律及 FairyGUI 官方品牌规则。涉及商业发布时，建议事先取得可核验的书面授权。
```

### FairyGUI Editor Online：THIRD_PARTY_NOTICES

````
# Third-Party Notices

FairyGUI Editor Online is licensed under the MIT License. That license applies
to this project's original code and documentation. Third-party software and
assets retain their own copyright and license terms.

When distributing a detached build of this project, include this file, the
project's `LICENSE` file, and `TRADEMARKS.md` with the build.

## Project provenance

- This project was originally created from a project structure generated by
  LayaAir Editor. The current Web application is built with Vite and does not
  require LayaAir Editor at development or runtime. It redistributes a frozen
  LayaAir Web runtime and related type declarations.
- `vendor/FairyGUI-Editor/` is a Git submodule of the official
  [FairyGUI Editor UI project](https://github.com/fairygui/FairyGUI-Editor).
  Its upstream README states that the editor UI project may be used freely and
  asks users to star the upstream project. This attribution covers the
  upstream-produced UI resources and icons in the submodule's `ui/` directory
  and their generated packages under `assets/resources/ui/`.
- `samples/FairyGUI-layabox/` is a Git submodule of the official
  [FairyGUI-Layabox](https://github.com/fairygui/FairyGUI-layabox) repository;
  its `demo/UIProject/` directory provides the default authoring project.

## Redistributed runtimes and libraries

### LayaAir

- Upstream: https://github.com/layabox/LayaAir
- Version in the frozen Web runtime: 3.3.10
- License: MIT
- Copyright: Copyright (c) 2022 layabox
- Included paths: `assets/laya/`, `engine/types/`

### FairyGUI for Layabox

- Upstream: https://github.com/fairygui/FairyGUI-layabox
- License: MIT
- Copyright: Copyright (c) 2015 fairygui.com
- Included paths: `assets/fairygui/`, `samples/FairyGUI-layabox/`

The redistributed FairyGUI runtime retains its embedded notices for the
DOTween easing implementation by Daniele Giardini and the BSD-licensed easing
equations by Robert Penner. `assets/fairygui/rawinflate.min.js` retains the
MIT notice for zlib.js by imaya.

### OpenFairyGUI

- Upstream: https://github.com/OpenFairyGUI/OpenFairyGUI
- Version: 0.2.1
- License: MIT
- Copyright: Copyright (c) 2026 OpenFairyGUI Contributors
- Packages: `@openfairygui/backend`, `@openfairygui/cli`,
  `@openfairygui/core`, `@openfairygui/functions`
- Generated outputs: `assets/resources/editor/runtime/openfairygui-backend-browser.js`,
  `assets/resources/editor/runtime/image-validation-worker.js`

The generated OpenFairyGUI browser outputs bundle code from these upstream
dependencies:

| Component | Version | License | Copyright | Upstream |
| --- | --- | --- | --- | --- |
| fast-xml-parser | 5.10.1 | MIT | Copyright (c) 2017 Amit Kumar Gupta | https://github.com/NaturalIntelligence/fast-xml-parser |
| jpeg-js | 0.4.4 | BSD-3-Clause | Copyright (c) 2014 Eugene Ware | https://github.com/eugeneware/jpeg-js |
| pako | 2.2.0 | MIT AND Zlib | Copyright (C) 2014-2017 Vitaly Puzrin and Andrei Tuputcyn | https://github.com/nodeca/pako |
| property-graph | 4.1.0 | MIT | Copyright (c) 2021 Don McCurdy | https://github.com/donmccurdy/property-graph |

`fast-xml-parser` may include its MIT-licensed parser support packages when
bundled. Their exact resolved versions are recorded in `package-lock.json`.

### fflate

- Upstream: https://github.com/101arrowz/fflate
- Version: 0.8.3
- License: MIT
- Copyright: Copyright (c) 2026 Arjun Barrett
- Usage: browser ZIP import and export

## License texts

The complete MIT License text used by this project and the MIT-licensed
components above is included in `LICENSE`. The full BSD-3-Clause notice for
`jpeg-js` and the additional notices required by `pako` are reproduced below.
Version-specific package metadata is recorded in `package-lock.json`.

### pako and zlib notices

Copyright (C) 2014-2017 by Vitaly Puzrin and Andrei Tuputcyn

`pako` is distributed under the MIT License text included in `LICENSE`. Its
zlib-derived implementation also retains this upstream notice:

Copyright (C) 1995-2013 Jean-loup Gailly and Mark Adler

This software is provided "as-is", without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the
use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim
   that you wrote the original software. If you use this software in a
   product, an acknowledgment in the product documentation would be
   appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be
   misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.

### jpeg-js BSD-3-Clause license

Copyright (c) 2014, Eugene Ware
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.
3. Neither the name of Eugene Ware nor the names of its contributors may be
   used to endorse or promote products derived from this software without
   specific prior written permission.

THIS SOFTWARE IS PROVIDED BY EUGENE WARE "AS IS" AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
EVENT SHALL EUGENE WARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
OF THE POSSIBILITY OF SUCH DAMAGE.
````
