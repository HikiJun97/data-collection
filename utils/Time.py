from dataclasses import dataclass


@dataclass(order=True)
class Time:
    hours: int
    minutes: int
    seconds: int

    def __init__(self, *args):
        if len(args) == 1 and isinstance(args[0], str):
            parts = args[0].split(":")
            if len(parts) != 3:
                raise ValueError("Input string must be in 'hh:mm:ss' format")
            self.hours, self.minutes, self.seconds = map(int, parts)
        elif len(args) == 3 and all(isinstance(x, int) for x in args):
            self.hours, self.minutes, self.seconds = args
        # elif len(args) == 1 and isinstance(args[0], (list, tuple)) and len(args[0]) == 3:
        #     self.hours, self.minutes, self.seconds = map(int, args[0])
        else:
            raise TypeError("Invalid input type or number of arguments")

        if not (0 <= self.hours):
            raise Exception("Hours must be non-negative")
        if not (0 <= self.minutes <= 59):
            raise Exception("Minutes must be between 0 and 59")
        if not (0 <= self.seconds <= 59):
            raise Exception("Seconds must be between 0 and 59")

    def __repr__(self) -> str:
        return f"{int(self.hours):02d}:{int(self.minutes):02d}:{int(self.seconds):02d}"

    def __len__(self) -> int:
        return len(str(self))

    def to_seconds(self) -> int:
        return 3600 * self.hours + 60 * self.minutes + self.seconds

    def __add__(self, other):
        return Time.from_seconds(self.to_seconds() + other.to_seconds())

    def __sub__(self, other):
        return Time.from_seconds(self.to_seconds() - other.to_seconds())

    @staticmethod
    def from_seconds(seconds: int):
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        seconds = seconds % 60
        return Time(hours, minutes, seconds)
