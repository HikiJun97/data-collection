import cv2


class CV2VideoCaptureContextManager:
    def __init__(self, *args, **kwargs):
        self.cap = cv2.VideoCapture(*args, **kwargs)

    def __enter__(self):
        if not self.cap.isOpened():
            raise ValueError("Cannot open the video source")
        return self.cap

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.cap.release()
