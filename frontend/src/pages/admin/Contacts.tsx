import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Tooltip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '@mui/material/styles';
import { contactAPI } from '../../services/api';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  adminNotes?: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  responseSent: boolean;
  responseDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactStats {
  byStatus: Array<{ _id: string; count: number }>;
  total: number;
  recent: number;
}

const AdminContacts: React.FC = () => {
  const { language } = useLanguage();
  const theme = useTheme();
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Dialog states
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailDetails, setEmailDetails] = useState({ email: '', subject: '' });
  const [editForm, setEditForm] = useState({
    status: '',
    priority: '',
    adminNotes: '',
  });

  useEffect(() => {
    loadContacts();
    loadStats();
  }, [currentPage, searchQuery, statusFilter, priorityFilter]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (priorityFilter) {
        params.priority = priorityFilter;
      }

      const response = await contactAPI.getContactMessages(params);
      setContacts(response.data.contacts);
      setTotalPages(response.data.pagination.totalPages);
      setTotalContacts(response.data.pagination.totalContacts);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await contactAPI.getContactStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to load contact stats:', err);
    }
  };

  const handleViewContact = (contact: ContactMessage) => {
    setSelectedContact(contact);
    setViewDialogOpen(true);
  };

  const handleEditContact = (contact: ContactMessage) => {
    setSelectedContact(contact);
    setEditForm({
      status: contact.status,
      priority: contact.priority,
      adminNotes: contact.adminNotes || '',
    });
    setEditDialogOpen(true);
  };

  const handleUpdateContact = async () => {
    if (!selectedContact) return;

    try {
      await contactAPI.updateContact(selectedContact._id, editForm);
      await loadContacts();
      setEditDialogOpen(false);
      setSelectedContact(null);
    } catch (err: any) {
      console.error('Failed to update contact:', err);
    }
  };

  const handleMarkAsResponded = async (contactId: string) => {
    try {
      await contactAPI.markAsResponded(contactId);
      await loadContacts();
    } catch (err: any) {
      console.error('Failed to mark as responded:', err);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'kin' ? 'rw-RW' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEmailReply = (email: string, subject: string) => {
    setEmailDetails({ email, subject });
    setEmailDialogOpen(true);
  };

  const handleEmailAction = (action: 'mailto' | 'copy') => {
    const { email, subject } = emailDetails;
    
    if (action === 'mailto') {
      try {
        const encodedSubject = encodeURIComponent(`Re: ${subject}`);
        const mailtoUrl = `mailto:${email}?subject=${encodedSubject}`;
        
        // Create a temporary link and click it
        const link = document.createElement('a');
        link.href = mailtoUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setEmailDialogOpen(false);
      } catch (error) {
        console.error('Failed to open email client:', error);
        alert('Failed to open email client. Please try copying the email address.');
      }
    } else if (action === 'copy') {
      navigator.clipboard.writeText(email).then(() => {
        alert(`Email copied to clipboard: ${email}`);
        setEmailDialogOpen(false);
      }).catch(() => {
        alert(`Email address: ${email}`);
        setEmailDialogOpen(false);
      });
    }
  };

  const handleWhatsAppReply = (name: string, subject: string) => {
    const message = `Re: ${subject} - ${name}`;
    const whatsappUrl = `https://wa.me/250788123456?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
        >
          {language === 'kin' ? 'Ubutumwa bw\'abakoresha' : 'Contact Messages'}
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          {language === 'kin' 
            ? 'Reba kandi ucurunge ubutumwa bwose bwoherejwe na bakoresha'
            : 'View and manage all messages sent by users'
          }
        </Typography>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 3, 
          mb: 4 
        }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {language === 'kin' ? 'Ubutumwa Bose' : 'Total Messages'}
                  </Typography>
                </Box>
                <EmailIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
            background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
            color: 'white',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.recent}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {language === 'kin' ? 'Bashya (7 iminsi)' : 'Recent (7 days)'}
                  </Typography>
                </Box>
                <CalendarIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
            background: 'linear-gradient(135deg, #ed6c02 0%, #e65100 100%)',
            color: 'white',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.byStatus.find(s => s._id === 'new')?.count || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {language === 'kin' ? 'Bishya' : 'New Messages'}
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
            background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
            color: 'white',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.byStatus.find(s => s._id === 'resolved')?.count || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {language === 'kin' ? 'Byakozwe' : 'Resolved'}
                  </Typography>
                </Box>
                <CheckIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder={language === 'kin' ? 'Shakisha ubutumwa...' : 'Search messages...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ minWidth: 200 }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{language === 'kin' ? 'Imiterere' : 'Status'}</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label={language === 'kin' ? 'Imiterere' : 'Status'}
          >
            <MenuItem value="">
              {language === 'kin' ? 'Byose' : 'All'}
            </MenuItem>
            <MenuItem value="new">{language === 'kin' ? 'Bishya' : 'New'}</MenuItem>
            <MenuItem value="in_progress">{language === 'kin' ? 'Bikora' : 'In Progress'}</MenuItem>
            <MenuItem value="resolved">{language === 'kin' ? 'Byakozwe' : 'Resolved'}</MenuItem>
            <MenuItem value="closed">{language === 'kin' ? 'Byahagaritswe' : 'Closed'}</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{language === 'kin' ? 'Ubwigenge' : 'Priority'}</InputLabel>
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            label={language === 'kin' ? 'Ubwigenge' : 'Priority'}
          >
            <MenuItem value="">
              {language === 'kin' ? 'Byose' : 'All'}
            </MenuItem>
            <MenuItem value="urgent">{language === 'kin' ? 'Bihutishije' : 'Urgent'}</MenuItem>
            <MenuItem value="high">{language === 'kin' ? 'Birenga' : 'High'}</MenuItem>
            <MenuItem value="medium">{language === 'kin' ? 'Bikiriye' : 'Medium'}</MenuItem>
            <MenuItem value="low">{language === 'kin' ? 'Bikeye' : 'Low'}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Results */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body1" sx={{ mb: 2 }}>
        {language === 'kin'
          ? `Byabonetse: ${totalContacts} ubutumwa`
          : `Found: ${totalContacts} messages`}
      </Typography>

      {/* Messages Table */}
      <Card sx={{ backgroundColor: theme.palette.background.paper }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{language === 'kin' ? 'Umuntu' : 'Person'}</TableCell>
                <TableCell>{language === 'kin' ? 'Umutwe' : 'Subject'}</TableCell>
                <TableCell>{language === 'kin' ? 'Imiterere' : 'Status'}</TableCell>
                <TableCell>{language === 'kin' ? 'Ubwigenge' : 'Priority'}</TableCell>
                <TableCell>{language === 'kin' ? 'Itariki' : 'Date'}</TableCell>
                <TableCell>{language === 'kin' ? 'Ibyakozwe' : 'Actions'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {language === 'kin' ? 'Nta butumwa buhari' : 'No messages found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow key={contact._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {contact.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {contact.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {contact.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {contact.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={language === 'kin' 
                          ? (contact.status === 'new' ? 'Bishya' : 
                             contact.status === 'in_progress' ? 'Bikora' :
                             contact.status === 'resolved' ? 'Byakozwe' : 'Byahagaritswe')
                          : contact.status.charAt(0).toUpperCase() + contact.status.slice(1)
                        }
                        color={getStatusColor(contact.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={language === 'kin' 
                          ? (contact.priority === 'urgent' ? 'Bihutishije' : 
                             contact.priority === 'high' ? 'Birenga' :
                             contact.priority === 'medium' ? 'Bikiriye' : 'Bikeye')
                          : contact.priority.charAt(0).toUpperCase() + contact.priority.slice(1)
                        }
                        color={getPriorityColor(contact.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(contact.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={language === 'kin' ? 'Reba' : 'View'}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewContact(contact)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={language === 'kin' ? 'Hindura' : 'Edit'}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditContact(contact)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={language === 'kin' ? 'Kohereza imeli' : 'Send Email'}>
                          <IconButton
                            size="small"
                            onClick={() => handleEmailReply(contact.email, contact.subject)}
                          >
                            <EmailIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={language === 'kin' ? 'WhatsApp' : 'WhatsApp'}>
                          <IconButton
                            size="small"
                            onClick={() => handleWhatsAppReply(contact.name, contact.subject)}
                          >
                            <WhatsAppIcon />
                          </IconButton>
                        </Tooltip>
                        {!contact.responseSent && (
                          <Tooltip title={language === 'kin' ? 'Emeza ko wasubije' : 'Mark as Responded'}>
                            <IconButton
                              size="small"
                              onClick={() => handleMarkAsResponded(contact._id)}
                            >
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon color="primary" />
            <Typography variant="h6">
              {language === 'kin' ? 'Ubutumwa bw\'umukoresha' : 'User Message'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedContact && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedContact.subject}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip
                    label={language === 'kin' 
                      ? (selectedContact.status === 'new' ? 'Bishya' : 
                         selectedContact.status === 'in_progress' ? 'Bikora' :
                         selectedContact.status === 'resolved' ? 'Byakozwe' : 'Byahagaritswe')
                      : selectedContact.status.charAt(0).toUpperCase() + selectedContact.status.slice(1)
                    }
                    color={getStatusColor(selectedContact.status) as any}
                  />
                  <Chip
                    label={language === 'kin' 
                      ? (selectedContact.priority === 'urgent' ? 'Bihutishije' : 
                         selectedContact.priority === 'high' ? 'Birenga' :
                         selectedContact.priority === 'medium' ? 'Bikiriye' : 'Bikeye')
                      : selectedContact.priority.charAt(0).toUpperCase() + selectedContact.priority.slice(1)
                    }
                    color={getPriorityColor(selectedContact.priority) as any}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {language === 'kin' ? 'Amakuru y\'umuntu' : 'Contact Information'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <PersonIcon color="primary" />
                  <Typography>{selectedContact.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <EmailIcon color="primary" />
                  <Typography>{selectedContact.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CalendarIcon color="primary" />
                  <Typography>{formatDate(selectedContact.createdAt)}</Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {language === 'kin' ? 'Ubutumwa' : 'Message'}
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: theme.palette.background.default }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedContact.message}
                  </Typography>
                </Paper>
              </Box>

              {selectedContact.adminNotes && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {language === 'kin' ? 'Ibitekerezo by\'umuyobozi' : 'Admin Notes'}
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: theme.palette.background.default }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedContact.adminNotes}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            {language === 'kin' ? 'Gufunga' : 'Close'}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setViewDialogOpen(false);
              if (selectedContact) {
                handleEditContact(selectedContact);
              }
            }}
          >
            {language === 'kin' ? 'Hindura' : 'Edit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        <DialogTitle>
          {language === 'kin' ? 'Hindura ubutumwa' : 'Edit Message'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>{language === 'kin' ? 'Imiterere' : 'Status'}</InputLabel>
              <Select
                value={editForm.status}
                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                label={language === 'kin' ? 'Imiterere' : 'Status'}
              >
                <MenuItem value="new">{language === 'kin' ? 'Bishya' : 'New'}</MenuItem>
                <MenuItem value="in_progress">{language === 'kin' ? 'Bikora' : 'In Progress'}</MenuItem>
                <MenuItem value="resolved">{language === 'kin' ? 'Byakozwe' : 'Resolved'}</MenuItem>
                <MenuItem value="closed">{language === 'kin' ? 'Byahagaritswe' : 'Closed'}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{language === 'kin' ? 'Ubwigenge' : 'Priority'}</InputLabel>
              <Select
                value={editForm.priority}
                onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
                label={language === 'kin' ? 'Ubwigenge' : 'Priority'}
              >
                <MenuItem value="low">{language === 'kin' ? 'Bikeye' : 'Low'}</MenuItem>
                <MenuItem value="medium">{language === 'kin' ? 'Bikiriye' : 'Medium'}</MenuItem>
                <MenuItem value="high">{language === 'kin' ? 'Birenga' : 'High'}</MenuItem>
                <MenuItem value="urgent">{language === 'kin' ? 'Bihutishije' : 'Urgent'}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label={language === 'kin' ? 'Ibitekerezo by\'umuyobozi' : 'Admin Notes'}
              value={editForm.adminNotes}
              onChange={(e) => setEditForm(prev => ({ ...prev, adminNotes: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            {language === 'kin' ? 'Kureka' : 'Cancel'}
          </Button>
          <Button variant="contained" onClick={handleUpdateContact}>
            {language === 'kin' ? 'Bika' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Reply Dialog */}
      <Dialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon color="primary" />
            <Typography variant="h6">
              {language === 'kin' ? 'Kohereza Imeli' : 'Send Email Reply'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              {language === 'kin' ? 'Kohereza imeli ku:' : 'Send email to:'}
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              {emailDetails.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {language === 'kin' ? 'Umutwe w\'ubutumwa:' : 'Subject:'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Re: {emailDetails.subject}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {language === 'kin' 
                ? 'Hitamo uburyo bwo kohereza imeli:'
                : 'Choose how to send the email:'
              }
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>
            {language === 'kin' ? 'Kureka' : 'Cancel'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleEmailAction('copy')}
            startIcon={<EmailIcon />}
          >
            {language === 'kin' ? 'Gukoporora Imeli' : 'Copy Email'}
          </Button>
          <Button
            variant="contained"
            onClick={() => handleEmailAction('mailto')}
            startIcon={<EmailIcon />}
          >
            {language === 'kin' ? 'Fungura Imeli' : 'Open Email Client'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminContacts;
