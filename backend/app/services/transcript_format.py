from app.models import Segment


def format_timestamp(seconds: float) -> str:
    total = int(seconds)
    return f"{total // 60:02d}:{total % 60:02d}"


def format_transcript(segments: list[Segment]) -> str:
    lines = []
    for s in segments:
        label = s.speaker.display_name or s.speaker.display_label if s.speaker else "Unknown"
        lines.append(f"[{format_timestamp(s.start_time)}-{format_timestamp(s.end_time)}] {label}: {s.text}")
    return "\n".join(lines)
