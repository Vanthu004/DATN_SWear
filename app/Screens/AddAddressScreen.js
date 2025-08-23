import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createAddress, updateAddress } from "../utils/api";
const AddAddressScreen = ({ navigation, route }) => {
  const editAddress = route.params?.address;
  const isEdit = !!editAddress;

  const [formData, setFormData] = useState({
    name: editAddress?.name || "",
    phone: editAddress?.phone || "",
    address: editAddress?.street || "",
    city: editAddress?.province || "",
    district: editAddress?.district || "",
    ward: editAddress?.ward || "",
    type: editAddress?.type || "home",         //  Mặc định là "home"
    is_default: editAddress?.is_default || false, //  Mặc định là false
  });

  // Province/District cascading state
  const [provinces, setProvinces] = useState([]); // full objects with districts
  const [districts, setDistricts] = useState([]); // list of district names
  const [wards, setWards] = useState([]); // list of ward names
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch("https://provinces.open-api.vn/api/?depth=3");
        const data = await res.json();
        data.sort((a, b) => a.name.localeCompare(b.name));
        setProvinces(data);
        // hydrate from existing form data when editing
        if (formData.city) {
          const found = data.find((p) => p.name === formData.city);
          if (found) {
            setSelectedProvince(found);
            const dists = (found.districts || []).map((d) => d.name).sort((a,b)=>a.localeCompare(b));
            setDistricts(dists);
            // If editing and district exists, sync wards
            if (formData.district) {
              const foundDistrict = found.districts?.find((d) => d.name === formData.district);
              if (foundDistrict) {
                setSelectedDistrict(foundDistrict);
                const wardList = (foundDistrict.wards || []).map((w) => w.name).sort((a,b)=>a.localeCompare(b));
                setWards(wardList);
              }
            }
          }
        }
      } catch (e) {
        console.log("Fetch provinces failed:", e);
      }
    };
    fetchProvinces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Hàm xử lý lưu hoặc cập nhật địa chỉ

  const handleSave = async () => {
  try {
    const errors = [];

    // Kiểm tra các trường bắt buộc
    if (!formData.name) errors.push("Họ và tên không được để trống.");
    else if (formData.name.length < 3) errors.push("Họ và tên phải có ít nhất 3 ký tự.");

    if (!formData.phone) {
      errors.push("Số điện thoại không được để trống.");
    } else if (!/^(0|\+84)[0-9]{9}$/.test(formData.phone)) {
      errors.push("Số điện thoại không hợp lệ (ví dụ: 0987654321).");
    }

    if (!formData.address || formData.address.length < 5) {
      errors.push("Địa chỉ phải có ít nhất 5 ký tự.");
    }

    if (!formData.city) errors.push("Vui lòng chọn Tỉnh/Thành phố.");
    if (!formData.district) errors.push("Vui lòng chọn Quận/Huyện.");
    if (!formData.ward) errors.push("Vui lòng chọn Phường/Xã.");
    // Validate district belongs to province
    if (formData.city && formData.district && districts.length > 0) {
      const isValidDistrict = districts.includes(formData.district);
      if (!isValidDistrict) {
        errors.push("Quận/Huyện không khớp với Tỉnh/Thành phố đã chọn.");
      }
    }
    // Validate ward belongs to district
    if (formData.district && formData.ward && wards.length > 0) {
      const isValidWard = wards.includes(formData.ward);
      if (!isValidWard) {
        errors.push("Phường/Xã không khớp với Quận/Huyện đã chọn.");
      }
    }

    // Nếu có lỗi, hiển thị
    if (errors.length > 0) {
      Alert.alert("Lỗi nhập liệu", errors.join("\n"));
      return;
    }

    // Tạo payload
    const addressPayload = {
      name: formData.name,
      phone: formData.phone,
      street: formData.address,
      ward: formData.ward,
      district: formData.district,
      province: formData.city,
      country: "Việt Nam",
      type: formData.type,
      is_default: formData.is_default,
    };

    // Gọi API
    if (isEdit) {
      await updateAddress(editAddress._id, addressPayload);
      Alert.alert("Thành công", "Địa chỉ đã được cập nhật.");
    } else {
      await createAddress(addressPayload);
      Alert.alert("Thành công", "Địa chỉ đã được lưu.");
    }

    navigation.goBack();
  } catch (error) {
    console.error("Lỗi khi lưu/cập nhật địa chỉ:", error);
    Alert.alert("Lỗi", "Không thể lưu/cập nhật địa chỉ. Vui lòng thử lại.");
  }
};


  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <View style={styles.backIconWrap}>
            <Ionicons name="arrow-back" size={22} color="#222" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}
        </Text>
      </View>

      {/* Bọc phần nội dung trong ScrollView để có thể cuộn */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>

            {/* Tên người nhận */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên người nhận</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Nhập tên người nhận"
              />
            </View>

            {/* Số điện thoại */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
              />
            </View>

            {/* Địa chỉ */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Địa chỉ cụ thể</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Nhập địa chỉ cụ thể"
                multiline
              />
            </View>

            {/* Phường/Xã */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phường/Xã</Text>
              <TouchableOpacity
                style={[styles.input, styles.selectInput]}
                onPress={() => {
                  if (!selectedDistrict) {
                    Alert.alert("Thông báo", "Vui lòng chọn Quận/Huyện trước");
                    return;
                  }
                  setShowWardModal(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={formData.ward ? styles.selectText : styles.placeholderText}>
                  {formData.ward || "Chọn phường/xã"}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#666" />
              </TouchableOpacity>
            </View>


            {/* Quận/Huyện và Tỉnh/Thành phố */}
            <View style={styles.row}>

              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Quận/Huyện</Text>
                <TouchableOpacity
                  style={[styles.input, styles.selectInput]}
                  onPress={() => {
                    if (!selectedProvince) {
                      Alert.alert("Thông báo", "Vui lòng chọn Tỉnh/Thành phố trước");
                      return;
                    }
                    setShowDistrictModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={formData.district ? styles.selectText : styles.placeholderText}>
                    {formData.district || "Chọn quận/huyện"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Tỉnh/Thành phố</Text>
                <TouchableOpacity
                  style={[styles.input, styles.selectInput]}
                  onPress={() => setShowProvinceModal(true)}
                  activeOpacity={0.7}
                >
                  <Text style={formData.city ? styles.selectText : styles.placeholderText}>
                    {formData.city || "Chọn tỉnh/thành phố"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#666" />
                </TouchableOpacity>
              </View>
            </View>


          </View>
          <View style={styles.form}>

            {/* Loại địa chỉ (type) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loại địa chỉ</Text>
              <View style={styles.typeSelector}>
                {["home", "office", "other"].map((typeOption) => (
                  <TouchableOpacity
                    key={typeOption}
                    style={[
                      styles.typeOption,
                      formData.type === typeOption && styles.selectedType,
                    ]}
                    onPress={() => setFormData({ ...formData, type: typeOption })}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        formData.type === typeOption && styles.selectedTypeText,
                      ]}
                    >
                      {typeOption === "home"
                        ? "Nhà riêng"
                        : typeOption === "office"
                          ? "Công ty"
                          : "Khác"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Checkbox Địa chỉ mặc định */}
            <View style={styles.inputGroup}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, is_default: !prev.is_default }))
                }
              >
                <Ionicons
                  name={formData.is_default ? "checkbox" : "square-outline"}
                  size={22}
                  color="#007AFF"
                />
                <Text style={{ marginLeft: 10, fontSize: 16 }}>
                  Đặt làm địa chỉ mặc định
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* Province Modal */}
      <Modal visible={showProvinceModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Chọn Tỉnh/Thành phố</Text>
            <FlatList
              data={provinces}
              keyExtractor={(item) => String(item.code)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedProvince(item);
                    setFormData((prev) => ({ ...prev, city: item.name, district: "", ward: "" }));
                    const dists = (item.districts || []).map((d) => d.name).sort((a,b)=>a.localeCompare(b));
                    setDistricts(dists);
                    setWards([]);
                    setSelectedDistrict(null);
                    setShowProvinceModal(false);
                  }}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowProvinceModal(false)}>
              <Text style={styles.modalCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* District Modal */}
      <Modal visible={showDistrictModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Chọn Quận/Huyện</Text>
            <FlatList
              data={districts}
              keyExtractor={(item, idx) => String(idx)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    // Find the district object from selectedProvince
                    const districtObj = selectedProvince.districts?.find(d => d.name === item);
                    if (districtObj) {
                      setSelectedDistrict(districtObj);
                      setFormData((prev) => ({ ...prev, district: item, ward: "" }));
                      const wardList = (districtObj.wards || []).map((w) => w.name).sort((a,b)=>a.localeCompare(b));
                      setWards(wardList);
                    }
                    setShowDistrictModal(false);
                  }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowDistrictModal(false)}>
              <Text style={styles.modalCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Ward Modal */}
      <Modal visible={showWardModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Chọn Phường/Xã</Text>
            <FlatList
              data={wards}
              keyExtractor={(item, idx) => String(idx)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData((prev) => ({ ...prev, ward: item }));
                    setShowWardModal(false);
                  }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowWardModal(false)}>
              <Text style={styles.modalCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Nút tạo ở dưới */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>
          {isEdit ? "Cập nhật địa chỉ" : "Lưu địa chỉ"}
        </Text>
      </TouchableOpacity>
      <View style={{height: 50}}></View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: {
    padding: 5,
  },
  backIconWrap: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  form: {
    padding: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    color: "#222",
    fontSize: 16,
  },
  placeholderText: {
    color: "#999",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    margin: 15,
    padding: 15,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
    
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  typeOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  selectedType: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  typeText: {
    color: "#333",
  },
  selectedTypeText: {
    color: "#fff",
    fontWeight: "600",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 100, // để tránh che nút phía dưới
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#0008",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalClose: {
    alignSelf: "flex-end",
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#007AFF",
    borderRadius: 6,
  },
  modalCloseText: {
    color: "#fff",
    fontWeight: "600",
  },


});

export default AddAddressScreen;
