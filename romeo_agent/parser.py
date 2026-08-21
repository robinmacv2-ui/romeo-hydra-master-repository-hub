"""Parser puro: texto -> (verb, entity, args). Sin efectos secundarios."""
import re

_PATTERN = re.compile(r"(?P<verb>\w+)\s*::\s*(?P<entity>\S+)?\s*(?P<args>.*)")


def parse_neutral(s: str) -> dict:
    s = s.strip()
    m = _PATTERN.match(s)
    if not m:
        return {"verb": "echo", "entity": "", "args": {"text": s}}

    verb = m.group("verb")
    entity = m.group("entity") or ""
    raw_args = m.group("args") or ""

    args = {}
    for k, v in re.findall(r"(\w+)=(\S+)", raw_args):
        args[k] = v

    if verb == "echo":
        texto = (entity + " " + raw_args).strip() if raw_args else entity
        args["text"] = texto
        entity = ""

    return {"verb": verb, "entity": entity, "args": args}
