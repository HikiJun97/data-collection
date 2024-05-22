import numpy as np
from insightface.app import FaceAnalysis


class FaceDetector:

    def __init__(self):
        self.app = FaceAnalysis()
        self.app.prepare(
            ctx_id=0, det_size=(640, 640)
        )  # GPU: ctx_id > 0, CPU: ctx_id = -1

    def detect_faces(self, frame: np.ndarray):
        app = FaceAnalysis()
        app.prepare(ctx_id=0, det_size=(640, 640))  # GPU: ctx_id > 0, CPU: ctx_id = -1

        faces = list()
        coordinates = list()
        faces = app.get(frame)
        for _, face in enumerate(faces):
            bbox = face.bbox.astype(int)
            x, y, w, h = bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]
            coordinates.append((x, y, w, h))

        return faces, coordinates
