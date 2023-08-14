export const corsConfig = {
  origin: ["http://localhost:3000", "http://localhost:5173"],
  methods: ["get", "post", "patch", "delete"],
  credentials: true,
  maxAge: 3600 * 6,
};