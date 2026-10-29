# PuerTS 3.0.3 补丁测试输入

只供 `lgui unity export` 的文件生成和前置检查测试使用。这里不是可运行的 PuerTS 包，也不包含任何原生库。

- 来源：[Tencent/puerts，Unity_v3.0.3](https://github.com/Tencent/puerts/releases/tag/Unity_v3.0.3)，源码提交 `d8871238a3774fd10600995a5325e4b2ab4e39fb`。
- 官方压缩包：`PuerTS_Core_3.0.3.tar.gz`，SHA256 `feafc11bf2f9dbdb7e5fd2546124a771ea69b0f7c1a194740d47cfffb721cea0`。
- `Puerts_il2cpp.cpp.txt` 原路径：`core/Editor/Resources/puerts/xil2cpp/Puerts_il2cpp.cpp.txt`。保留原始字节、UTF-8 BOM 和 LF，113,324 字节，SHA256 `318425f7f5eb857b5fc1f664e77b68ff569a99a62641c02ae4819261b0f03aaf`。
- 固定四处 Unity 6.6 Unbox 补丁后的 SHA256：`3e3b479159fdd56c94ed08f4a7e756dbbfa36b9b4c714e99a40e5fc8f6ec9b83`。
- `LICENSE.txt` 是压缩包 `core/LICENSE` 的原始字节副本，保留原名称以外的全部内容和 CRLF，SHA256 `ca54331da944453e714d3e69a056290bde7572550b7d7e099ac7fb7d2ad28e01`。

保留模板中的 Tencent 署名。许可及第三方条款见同目录 `LICENSE.txt`。测试辅助函数只为检查文件生成构造最小 Unity 工程，不代表这些文件可以通过 Unity 编译或运行验收。
