import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Plus, Trash2, ArrowLeft, Save, AlertCircle, Calendar } from 'lucide-react';

export const FeeForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [course, setCourse] = useState('B.Tech Computer Science');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [feeHeads, setFeeHeads] = useState([
    { title: 'Tuition Fee', amount: '65000' },
    { title: 'Examination Fee', amount: '4500' },
    { title: 'Development & Library Fee', amount: '5500' },
  ]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchFeeStructure();
    } else {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      setDueDate(defaultDate.toISOString().split('T')[0]);
    }
  }, [id]);

  const fetchFeeStructure = async () => {
    try {
      const res = await api.get(`/api/fees/${id}`);
      if (res.success && res.data) {
        const item = res.data;
        setCourse(item.course);
        setAcademicYear(item.academicYear);
        setDescription(item.description || '');
        if (item.dueDate) {
          setDueDate(new Date(item.dueDate).toISOString().split('T')[0]);
        }
        if (item.feeHeads && item.feeHeads.length > 0) {
          setFeeHeads(item.feeHeads.map((h) => ({ title: h.title, amount: String(h.amount) })));
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load fee structure');
    } finally {
      setFetching(false);
    }
  };

  const handleHeadChange = (index, field, value) => {
    const updated = [...feeHeads];
    updated[index][field] = value;
    setFeeHeads(updated);
  };

  const addFeeHead = () => {
    setFeeHeads([...feeHeads, { title: '', amount: '' }]);
  };

  const removeFeeHead = (index) => {
    if (feeHeads.length <= 1) {
      alert('Fee structure must have at least one fee head');
      return;
    }
    setFeeHeads(feeHeads.filter((_, idx) => idx !== index));
  };

  const computedTotal = feeHeads.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!course.trim() || !academicYear.trim() || !dueDate) {
      setError('Please fill in Course, Academic Year, and Due Date');
      return;
    }

    if (computedTotal <= 0) {
      setError('Total fee must be greater than zero');
      return;
    }

    const validHeads = feeHeads
      .filter((h) => h.title.trim() && !isNaN(parseFloat(h.amount)))
      .map((h) => ({
        title: h.title.trim(),
        amount: parseFloat(h.amount),
      }));

    if (validHeads.length === 0) {
      setError('Please provide at least one valid fee head with title and amount');
      return;
    }

    setLoading(true);

    const payload = {
      course: course.trim(),
      academicYear: academicYear.trim(),
      dueDate,
      description: description.trim(),
      feeHeads: validHeads,
      totalAmount: computedTotal,
    };

    try {
      if (isEditing) {
        await api.put(`/api/fees/${id}`, payload);
      } else {
        await api.post('/api/fees', payload);
      }
      navigate('/admin/fees');
    } catch (err) {
      setError(err.message || 'Failed to save fee structure');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="page-container flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="mb-4">
        <Link to="/admin/fees" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Fee Structures
        </Link>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <h1 className="page-title">
            {isEditing ? 'Edit Fee Structure' : 'Create New Fee Structure'}
          </h1>
          <p className="page-subtitle">
            Configure fee heads, component amounts, and payment deadlines
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="course-name">Course / Academic Program</label>
              <input
                id="course-name"
                type="text"
                required
                className="form-input"
                placeholder="e.g. B.Tech Computer Science"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="academic-year">Academic Session / Year</label>
              <input
                id="academic-year"
                type="text"
                required
                className="form-input"
                placeholder="e.g. 2026-2027"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="due-date">Payment Due Date Deadline</label>
              <div className="input-with-icon">
                <Calendar className="input-icon" size={18} />
                <input
                  id="due-date"
                  type="date"
                  required
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Notes / Description (Optional)</label>
              <input
                id="description"
                type="text"
                className="form-input"
                placeholder="e.g. Semester 3 Annual Fee"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="fee-heads-builder">
            <div className="heads-builder-header">
              <h3 className="section-heading-sm">Fee Heads Breakdown</h3>
              <button
                type="button"
                onClick={addFeeHead}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={16} /> Add Head
              </button>
            </div>

            <div className="heads-builder-list">
              {feeHeads.map((head, idx) => (
                <div key={idx} className="head-row">
                  <div className="head-input-title">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tuition Fee, Exam Fee, Transport"
                      className="form-input"
                      value={head.title}
                      onChange={(e) => handleHeadChange(idx, 'title', e.target.value)}
                    />
                  </div>
                  <div className="head-input-amount">
                    <div className="input-prefix-box">
                      <span>₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        step="any"
                        placeholder="Amount"
                        className="form-input"
                        value={head.amount}
                        onChange={(e) => handleHeadChange(idx, 'amount', e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFeeHead(idx)}
                    className="icon-btn text-danger"
                    title="Remove Head"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="total-calculation-box">
              <span>Calculated Total Amount:</span>
              <span className="total-calc-value">₹{computedTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="form-actions mt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
            >
              <Save size={18} />
              {loading ? 'Saving...' : isEditing ? 'Update Structure' : 'Create Structure'}
            </button>
            <Link to="/admin/fees" className="btn btn-secondary btn-lg">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
