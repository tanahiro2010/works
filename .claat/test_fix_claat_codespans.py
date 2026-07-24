import importlib.util
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("fix-claat-codespans.py")
SPEC = importlib.util.spec_from_file_location("fix_claat_codespans", MODULE_PATH)
assert SPEC and SPEC.loader
FIX = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(FIX)


class SourceHeadingAnnotationTest(unittest.TestCase):
    def test_inline_code_punctuation_is_preserved(self) -> None:
        self.assertEqual(
            FIX.markdown_inline_to_text("`get_my_reservation` tool を登録する"),
            "get_my_reservation tool を登録する",
        )
        self.assertEqual(
            FIX.markdown_inline_to_text("`<form>`を tool に対応させる"),
            "<form>を tool に対応させる",
        )

    def test_annotation_continues_after_inline_code_heading(self) -> None:
        markdown = """# Test

## Step

Duration: 0:01:00

### Before

### `get_my_reservation` tool を登録する

### After
"""
        html = """<google-codelab-step label="Step" duration="1">
<h2>Before</h2>
<h2><code>get_my_reservation</code> tool を登録する</h2>
<h2>After</h2>
</google-codelab-step>"""

        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "claat.md"
            source.write_text(markdown, encoding="utf-8")
            annotated = FIX.annotate_source_headings(html, str(source))

        self.assertEqual(annotated.count('data-claat-source-heading-level="3"'), 3)


if __name__ == "__main__":
    unittest.main()
