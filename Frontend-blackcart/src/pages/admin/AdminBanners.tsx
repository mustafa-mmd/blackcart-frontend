import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Edit2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Link2,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import bannerService, { type HeroBanner } from "../../services/bannerService";
import Loader from "../../components/common/Loader";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const DESKTOP_ASPECT_RATIO = 16 / 5;
const DESKTOP_ASPECT_TOLERANCE = 0.05;
type ImageKind = "desktop" | "mobile";
type Dimensions = { width: number; height: number };

const hasDesktopBannerRatio = ({ width, height }: Dimensions) =>
  Math.abs(width / height - DESKTOP_ASPECT_RATIO) <=
  DESKTOP_ASPECT_TOLERANCE;

const readDimensions = (file: File) =>
  new Promise<Dimensions>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      reject(new Error("The selected image could not be read."));
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });

const errorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    return response?.data?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<HeroBanner | null>(null);
  const [form, setForm] = useState({
    title: "",
    link: "",
    order: 0,
    isActive: true,
  });
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");
  const [desktopDimensions, setDesktopDimensions] =
    useState<Dimensions | null>(null);
  const [mobileDimensions, setMobileDimensions] = useState<Dimensions | null>(
    null,
  );

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setBanners(await bannerService.getAdminBanners());
    } catch (error) {
      toast.error(errorMessage(error, "Failed to load banners."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBanners();
  }, []);

  const resetForm = () => {
    setForm({ title: "", link: "", order: 0, isActive: true });
    setDesktopFile(null);
    setMobileFile(null);
    setDesktopPreview("");
    setMobilePreview("");
    setDesktopDimensions(null);
    setMobileDimensions(null);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setSelectedBanner(null);
    resetForm();
  };

  const openEdit = (banner: HeroBanner) => {
    resetForm();
    setSelectedBanner(banner);
    setForm({
      title: banner.title || "",
      link: banner.link || "",
      order: banner.order || 0,
      isActive: banner.isActive,
    });
  };

  const handleFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
    kind: ImageKind,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(
        `${kind === "desktop" ? "Desktop" : "Mobile"} image must be JPG, PNG, WEBP, or GIF.`,
      );
      event.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `${kind === "desktop" ? "Desktop" : "Mobile"} image exceeds the 5MB maximum.`,
      );
      event.target.value = "";
      return;
    }
    try {
      const dimensions = await readDimensions(file);
      if (kind === "desktop" && !hasDesktopBannerRatio(dimensions)) {
        setDesktopDimensions(dimensions);
        setDesktopFile(null);
        setDesktopPreview("");
        toast.error(
          `Desktop image must use the 16:5 banner ratio (recommended 1920x600px). Detected ${dimensions.width}x${dimensions.height}px.`,
        );
        event.target.value = "";
        return;
      }
      if (kind === "mobile" && dimensions.width >= dimensions.height) {
        setMobileDimensions(dimensions);
        setMobileFile(null);
        setMobilePreview("");
        toast.error(
          `Mobile image must be portrait. Detected ${dimensions.width}x${dimensions.height}px.`,
        );
        event.target.value = "";
        return;
      }
      const preview = URL.createObjectURL(file);
      if (kind === "desktop") {
        if (desktopPreview.startsWith("blob:"))
          URL.revokeObjectURL(desktopPreview);
        setDesktopFile(file);
        setDesktopPreview(preview);
        setDesktopDimensions(dimensions);
      } else {
        if (mobilePreview.startsWith("blob:"))
          URL.revokeObjectURL(mobilePreview);
        setMobileFile(file);
        setMobilePreview(preview);
        setMobileDimensions(dimensions);
      }
    } catch (error) {
      toast.error(errorMessage(error, "The selected image could not be read."));
      event.target.value = "";
    }
  };

  const buildFormData = () => {
    const data = new FormData();
    if (desktopFile) data.append("image", desktopFile);
    if (mobileFile) data.append("mobileImage", mobileFile);
    data.append("title", form.title);
    data.append("link", form.link);
    data.append("order", String(form.order));
    data.append("isActive", String(form.isActive));
    return data;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedBanner) {
      const missing = [];
      if (!desktopFile) missing.push("Desktop / Laptop Image");
      if (!mobileFile) missing.push("Mobile Image");
      if (missing.length) {
        toast.error(
          `Missing required file${missing.length > 1 ? "s" : ""}: ${missing.join(" and ")}.`,
        );
        return;
      }
    }
    try {
      setLoading(true);
      if (selectedBanner)
        await bannerService.updateBanner(selectedBanner._id, buildFormData());
      else await bannerService.createBanner(buildFormData());
      toast.success(
        selectedBanner
          ? "Banner updated successfully."
          : "Banner created successfully.",
      );
      closeModal();
      await fetchBanners();
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          selectedBanner
            ? "Failed to update banner."
            : "Failed to create banner.",
        ),
      );
      setLoading(false);
    }
  };

  const handleToggle = async (banner: HeroBanner) => {
    try {
      await bannerService.updateBanner(banner._id, {
        isActive: !banner.isActive,
      });
      await fetchBanners();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to change banner status."));
    }
  };

  const handleDelete = async (banner: HeroBanner) => {
    if (!window.confirm("Delete this banner and both Cloudinary images?"))
      return;
    try {
      await bannerService.deleteBanner(banner._id);
      toast.success("Banner deleted successfully.");
      await fetchBanners();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to delete banner."));
    }
  };

  const getImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${import.meta.env.VITE_API_URL || "https://blackcart-backend.onrender.com"}${url}`;
  };

  const UploadControl = ({
    kind,
    preview,
    currentUrl,
  }: {
    kind: ImageKind;
    preview: string;
    currentUrl?: string;
  }) => {
    const isMobile = kind === "mobile";
    const displayUrl = preview || getImageUrl(currentUrl);
    return (
      <div className="rounded-xl border border-gray-200 p-4 space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            {isMobile
              ? "Mobile Image — 1080x1800 portrait (3:5)"
              : "Desktop / Laptop Image — 1920x600 (16:5)"}
            {!selectedBanner && <span className="text-red-500"> *</span>}
          </label>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG, WEBP, or GIF. Maximum 5MB.
          </p>
        </div>
        {displayUrl && (
          <div
            className={`relative overflow-hidden rounded-lg bg-gray-100 border ${isMobile ? "h-64" : "aspect-[16/5]"}`}
          >
            <img
              src={displayUrl}
              alt={`${isMobile ? "Mobile" : "Desktop"} banner preview`}
              className="h-full w-full object-contain"
            />
            {preview && (
              <button
                type="button"
                aria-label={`Remove selected ${kind} image`}
                onClick={() => {
                  if (kind === "desktop") {
                    setDesktopFile(null);
                    setDesktopPreview("");
                    setDesktopDimensions(null);
                  } else {
                    setMobileFile(null);
                    setMobilePreview("");
                    setMobileDimensions(null);
                  }
                }}
                className="absolute top-2 right-2 rounded-full bg-red-600 text-white p-1.5"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
          <Upload className="h-6 w-6 text-gray-400 mb-1" />
          <span className="text-sm font-medium text-blue-600">
            {currentUrl ? `Replace ${kind} image` : `Choose ${kind} image`}
          </span>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => void handleFile(event, kind)}
          />
        </label>
        {!isMobile && desktopDimensions && (
          <p
            className={`text-xs font-medium ${hasDesktopBannerRatio(desktopDimensions) ? "text-green-600" : "text-red-600"}`}
          >
            Detected dimensions: {desktopDimensions.width}x
            {desktopDimensions.height}px{" "}
            {hasDesktopBannerRatio(desktopDimensions)
              ? "— 16:5 banner ratio accepted"
              : "— rejected: upload 1920x600 (16:5)"}
          </p>
        )}
        {isMobile && mobileDimensions && (
          <p
            className={`text-xs font-medium ${mobileDimensions.width >= mobileDimensions.height ? "text-red-600" : "text-green-600"}`}
          >
            Detected dimensions: {mobileDimensions.width}x
            {mobileDimensions.height}px{" "}
            {mobileDimensions.width >= mobileDimensions.height
              ? "— rejected: portrait required"
              : "— portrait accepted"}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-blue-600" />
            Hero Banners
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage responsive desktop and mobile homepage artwork.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void fetchBanners()}
            aria-label="Refresh banners"
            className="p-2 border rounded-lg"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            <Plus className="h-5 w-5" />
            Add Banner
          </button>
        </div>
      </div>

      {loading && banners.length === 0 ? (
        <div className="min-h-80 flex items-center justify-center">
          <Loader size="lg" color="primary" />
        </div>
      ) : banners.length === 0 ? (
        <div className="p-12 text-center bg-white border rounded-xl">
          <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h2 className="font-bold text-xl">No banners uploaded</h2>
        </div>
      ) : (
        <div className="grid gap-5">
          {banners.map((banner) => (
            <article
              key={banner._id}
              className={`bg-white border rounded-xl overflow-hidden shadow-sm ${banner.isActive ? "" : "opacity-70"}`}
            >
              <div className="grid lg:grid-cols-[2fr_1fr_2fr]">
                <img
                  src={getImageUrl(banner.url)}
                  alt={`${banner.title || "Banner"} desktop`}
                  className="w-full h-48 object-cover bg-gray-100"
                />
                <img
                  src={getImageUrl(banner.mobileUrl || banner.url)}
                  alt={`${banner.title || "Banner"} mobile`}
                  className="w-full h-48 object-contain bg-gray-900"
                />
                <div className="p-5 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <h2 className="font-bold text-lg mr-auto">
                        {banner.title || "Untitled banner"}
                      </h2>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                        Order {banner.order}
                      </span>
                    </div>
                    <p
                      className={`inline-block mt-3 text-xs font-semibold px-2 py-1 rounded ${banner.mobileUrl ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
                    >
                      {banner.mobileUrl
                        ? "Dedicated mobile image"
                        : "Using desktop fallback on mobile"}
                    </p>
                    {banner.link && (
                      <p className="flex items-center gap-2 text-sm text-gray-500 mt-3 truncate">
                        <Link2 className="h-4 w-4" />
                        {banner.link}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => void handleToggle(banner)}
                      aria-label={
                        banner.isActive
                          ? "Deactivate banner"
                          : "Activate banner"
                      }
                      className="p-2 border rounded-lg"
                    >
                      {banner.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => openEdit(banner)}
                      className="p-2 border rounded-lg flex gap-1 items-center"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => void handleDelete(banner)}
                      aria-label="Delete banner"
                      className="p-2 border border-red-200 text-red-600 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {(showCreateModal || selectedBanner) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-auto my-4 overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between bg-gray-50">
              <h2 className="text-xl font-bold">
                {selectedBanner ? "Edit Banner" : "Upload Hero Banner"}
              </h2>
              <button onClick={closeModal} aria-label="Close modal">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <UploadControl
                  kind="desktop"
                  preview={desktopPreview}
                  currentUrl={selectedBanner?.url}
                />
                <UploadControl
                  kind="mobile"
                  preview={mobilePreview}
                  currentUrl={selectedBanner?.mobileUrl}
                />
              </div>
              {selectedBanner && !selectedBanner.mobileUrl && (
                <p className="text-sm bg-amber-50 text-amber-800 p-3 rounded-lg">
                  This legacy banner currently uses its desktop image as the
                  mobile fallback. You may add only a mobile image here.
                </p>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <label className="text-sm font-medium">
                  Banner Title (Optional)
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border p-2"
                  />
                </label>
                <label className="text-sm font-medium">
                  Redirect Link (Optional)
                  <input
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    className="mt-1 w-full rounded-md border p-2"
                  />
                </label>
                <label className="text-sm font-medium">
                  Sort Order
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: Number(e.target.value) || 0 })
                    }
                    className="mt-1 w-full rounded-md border p-2"
                  />
                </label>
                <label className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                  />
                  Active
                </label>
              </div>
              <div className="border-t pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  {loading
                    ? "Saving…"
                    : selectedBanner
                      ? "Save Changes"
                      : "Upload Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
