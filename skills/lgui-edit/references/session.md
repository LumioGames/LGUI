The CLI supports `clients` and `call <clientId> <request.json> [new-export.zip]`. The request file lives in the user workspace. A state request is `{"method":"state"}`. Query without selector returns the full unsaved UAM. Read selector IDs from it.

Mutation shape:

```json
{"method":"preflight","identity":{"sessionId":"FROM-STATE","generation":1,"revision":0},"operations":[{"kind":"setDisplayNodeProps","selector":{"packageId":"FROM-QUERY","componentResourceId":"FROM-QUERY","displayNodeId":"FROM-QUERY"},"props":{"text":"New title"}}]}
```

Replace every example identity/selector with queried values. Preflight leaves state untouched. Send the same identity/operations with `method:transact` and a new requestId. A stale identity is a conflict, not permission to overwrite. After a timeout/result_unknown retry the **identical** requestId and payload; changing the ID can duplicate a write. The current client caches 512 write requests without silent eviction. Save/reopen at its limit; after reload query a fresh session identity.

`undo`, `redo`, `save`: identity + requestId. For save, include an actual selector and require `verification.status=verified`, workspace persistence and dirty=false. `export`: identity, dirty=false; the CLI writes returned ZIP bytes to a new explicit output path. Saving uses OPFS/IndexedDB, not the original disk ZIP. Browser profile/origin determines that workspace. Use normal UI reopen/reload, then query and compare semantics. For automated regression, `verify-editor --workspace <workspace> -- --persistent` uses a dedicated test profile and the fixed Inventory fixture; never run it against a user's personal browser profile.

Full textProperties and individual text/font/fontSize/color fields cannot be mixed. Current transactional operations are limited to 1–50 setDisplayNodeProps operations. Tokens in `闭环验证/agent-connection.local.json` are local temporary secrets; never log or publish them.
