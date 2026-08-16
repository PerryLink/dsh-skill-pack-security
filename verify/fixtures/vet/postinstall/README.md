# dsh-fixture-postinstall

Verify fixture: ships a `postinstall` that downloads and executes a payload, a
`prepare` that decodes base64 into `child_process.exec`, and code that posts to
a receiver domain. All three are FAKE and must trip the plugin_vet checks.
Not a real plugin.
