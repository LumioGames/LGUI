Unity 6000.6.6f1 / PuerTS 3.0.3 IL2CPP compatibility patch

Observed failure: il2cpp-build-first/build-20261016-085952.log reports
C2039/C3861 at Puerts_il2cpp.cpp lines 102, 757, 1063 and 1078.
This existing real Windows IL2CPP build is the failing regression evidence.

Cause checked against this installed editor's sources:
Editor/Data/il2cpp/libil2cpp/vm/Object.h:35-38 provides GetRawData, not Unbox.
vm/ObjectInlines.h:14-17 returns obj + 1, the address past the object header.
il2cpp-api.cpp:1091-1094 implements il2cpp_object_unbox by calling GetRawData.
il2cpp-api-functions.h:208 declares void* il2cpp_object_unbox(Il2CppObject*).
The PuerTS template already includes il2cpp-api.h at line 13.

The patch replaces only those four old internal API calls with the existing
public C API. Arguments, null checks, object ownership and copy length remain
the same. It targets the pinned isolated editor/package pair; no broad claim
of all Unity versions or other PuerTS backends is made. No version guard is
needed for this isolated patch. A reusable multi-version fork would need an
explicit emitted native version macro, since the existing generator emits
UNITY_6000_0_OR_NEWER but does not emit UNITY_6000_6_OR_NEWER.

Reproduce from the migration root, without deleting any caches:
  pwsh -File evidence/compatibility/apply-unbox-compat.ps1
  pwsh -File scripts/run-unity.ps1 -Action generate -EvidenceName il2cpp-unbox-generate
  pwsh -File scripts/run-unity.ps1 -Action build -EvidenceName il2cpp-unbox-build

The patch script pins both input/output hashes, preserves a byte-exact
original, rejects unknown input, and treats the already-patched hash as a no-op.
Regeneration is required because generated C++ would otherwise retain the
old calls. Build success alone does not establish Player runtime correctness.

Actual validation on 2026-10-16:
  Generate: exit 0, evidence/il2cpp-unbox-generate.
  Build: exit 0 / Succeeded, evidence/il2cpp-unbox-build.
  StandaloneWindows64 IL2CPP: 399259668 total bytes, 11.3732729 seconds,
  0 errors and 7 existing C# deprecation warnings (Stage.stageWidth /
  Stage.stageHeight and FindFirstObjectByType). No native compile errors.
  Generated C++ contains 4 public unbox calls and 0 old Object::Unbox calls.
  The 25 protected Host/Editor/scene/TS/UI files are byte-identical before/after.
  Original/patched template has 3060 lines; exactly lines 102, 757, 1063, 1078
  differ. See unbox-exact-diff.json and protected-inputs-before/after.json.
  baseline-player-build.json and baseline-build-hashes.json preserve this
  baseline independently of subsequent feature work and overwritten summaries.
